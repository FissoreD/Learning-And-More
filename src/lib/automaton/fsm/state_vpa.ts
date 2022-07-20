import { todo } from "../../tools";
import { ALPHABET_TYPE, ALPH_TYPE_LIST } from "./VPA";

export interface AlphabetVPA { INT: string[], CALL: string[], RET: string[] }

type transition = {
  INT: { [letter: string]: StateVPA[] },
  CALL: { [letter: string]: { successors: StateVPA[], symbolToPush: string } },
  RET: { [letter: string]: { [stackTop: string]: StateVPA[] } }
}

export class StateVPA {
  isAccepting: boolean;
  isInitial: boolean;
  alphabet: AlphabetVPA;
  private outTransitions: transition;
  private inTransitions: transition;
  private successors: Set<StateVPA>;
  private predecessor: Set<StateVPA>;
  private mapAlphSymbolToType: Map<String, ALPHABET_TYPE>
  name: string;
  stackAlphabet: string[];

  /**
   * `isAccepting` and `isInitial` are _optional_ and if not specified
   * are supposed to be _false_
   */
  constructor(p: { name: string, isAccepting?: boolean, isInitial?: boolean, alphabet: AlphabetVPA, stackAlphabet: string[] }) {
    this.name = p.name;
    this.stackAlphabet = p.stackAlphabet;
    this.isAccepting = p.isAccepting || false;
    this.isInitial = p.isInitial || false;
    this.alphabet = p.alphabet;
    this.outTransitions = { INT: {}, CALL: {}, RET: {} };
    this.inTransitions = { INT: {}, CALL: {}, RET: {} };
    this.successors = new Set();
    this.predecessor = new Set();
    this.mapAlphSymbolToType = new Map()
    ALPH_TYPE_LIST.forEach(type => p.alphabet[type].forEach(s => {
      if (this.mapAlphSymbolToType.has(s) && this.mapAlphSymbolToType.get(s) !== type)
        throw new Error("The alphabet is not valid since it is not a disjoint union of three sets !")
      this.mapAlphSymbolToType.set(s, type)
    }))


    for (const stackTop of p.stackAlphabet) {
      for (const letter of p.alphabet.CALL) {
        this.outTransitions.CALL![letter] = { successors: [], symbolToPush: "" }
        this.inTransitions.CALL![letter] = { successors: [], symbolToPush: "" }
      }
      for (const letter of p.alphabet.CALL) {
        this.outTransitions.RET![letter] = { [stackTop]: [] }
        this.inTransitions.RET![letter] = { [stackTop]: [] }
      }
    }
    for (const letter of p.alphabet.INT) {
      this.outTransitions.INT![letter] = []
      this.inTransitions.INT![letter] = []
    }
  }

  addTransition(p: { type?: ALPHABET_TYPE, symbol: string, topStack?: string, successor?: StateVPA }) {
    p.topStack = p.topStack || undefined
    p.successor = p.successor || undefined
    let succ: StateVPA[] = [], pred: StateVPA[] = [];
    p.type = p.type || this.mapAlphSymbolToType.get(p.symbol)!

    if (this.mapAlphSymbolToType.has(p.symbol) &&
      p.type !== this.mapAlphSymbolToType.get(p.symbol))
      throw new Error(`You can't add a transition of type ${p.type} with symbol ${p.symbol}, because ${p.symbol} belongs is of type ${this.mapAlphSymbolToType.get(p.symbol)}`)

    if (p.type === undefined)
      throw new Error(`You must specify the type of Alphabet for ${p.symbol} since it is not known`)

    if (!this.mapAlphSymbolToType.has(p.symbol))
      this.mapAlphSymbolToType.set(p.symbol, p.type)

    switch (p.type) {
      case "INT": {
        succ = (this.outTransitions.INT[p.symbol] = this.outTransitions.INT[p.symbol] || [])
        if (p.successor)
          pred = (p.successor.inTransitions.INT[p.symbol] = p.successor.inTransitions.INT[p.symbol] || [])
        break;
      }
      case "RET": {
        let succ1, pred1;
        if (p.topStack === undefined)
          throw new Error("Top stack should not be undefined")
        succ1 = (this.outTransitions.RET[p.symbol] = (this.outTransitions.RET[p.symbol] || {}))
        if (p.successor)
          pred1 = (p.successor.inTransitions.RET[p.symbol] = (p.successor.inTransitions.RET[p.symbol] || {}))
        succ = (succ1[p.topStack] = (succ1[p.topStack] || []))
        if (pred1)
          pred = (pred1[p.topStack] = (pred1[p.topStack] || []))
        break;
      }
      case "CALL": {
        if (p.topStack === undefined)
          throw new Error("Top stack should not be undefined")

        let succ1, pred1;
        succ1 = (this.outTransitions.CALL[p.symbol] = (this.outTransitions.CALL[p.symbol] || {}))
        if (p.successor) {
          pred1 = (p.successor.inTransitions.CALL[p.symbol] = (p.successor.inTransitions.CALL[p.symbol] || {}))
          if (pred1) pred1.symbolToPush = p.topStack;
          pred = pred1?.successors
        }
        succ1.symbolToPush = p.topStack;
        succ = succ1.successors;
        break;
      }
    }

    if (p.successor) {
      if ((succ.length === 0 || pred?.length === 0) && !this.alphabet[p.type].includes(p.symbol)) {
        this.alphabet[p.type].push(p.symbol)
      }
      this.successors.add(p.successor)
      p.successor.predecessor.add(this)
      succ.push(p.successor)
      pred.push(this)
    }
    return succ
  }

  getSuccessor(p: { type?: ALPHABET_TYPE, symbol: string, topStack?: string, stack?: string[] }): StateVPA[] {
    let type = p.type || this.mapAlphSymbolToType.get(p.symbol)
    if (type === undefined)
      throw new Error(`You should specify a type for this symbol : ${p.symbol}`)

    try {
      if (type === "INT")
        return this.outTransitions[type][p.symbol]
      if (type === "CALL") {
        let tr = this.outTransitions[type][p.symbol]
        p.stack!.push(tr.symbolToPush)
        return tr.successors
      }
      if (type === "RET" && p.topStack) {
        return this.outTransitions[type][p.symbol][p.topStack]
      }
    } catch (e) {
      return []
    }

    throw new Error(`The top stack symbol should be specified for ${p.symbol}`)
  }

  getPredecessor(p: { type?: ALPHABET_TYPE, symbol: string, topStack?: string }) {
    let type = p.type || this.mapAlphSymbolToType.get(p.symbol)
    if (type === undefined)
      throw new Error(`You should specify a type for this symbol : ${p.symbol}`)
    if (type === "INT")
      return this.inTransitions["INT"][p.symbol]
    if (type === "CALL")
      return this.inTransitions["CALL"][p.symbol].successors
    if (p.topStack)
      return this.inTransitions["RET"][p.symbol][p.topStack]
    throw new Error(`The top stack symbol should be specified for ${p.symbol}`)
  }


  getOutTransitionNumber(): number {
    return todo()
  }

  getAllSuccessors() {
    return this.successors
  }

  getAllOutTransitions() {
    return this.outTransitions
  }

  clone(name?: string) {
    return new StateVPA({ ...this, name: name || this.name })
  }

  static Bottom(alphabet: AlphabetVPA, stackAlphabet: string[]) {
    return new StateVPA({ name: "bottom", isAccepting: false, isInitial: false, alphabet, stackAlphabet })
  }

  getType(symbol: string) {
    return this.mapAlphSymbolToType.get(symbol)!
  }
}