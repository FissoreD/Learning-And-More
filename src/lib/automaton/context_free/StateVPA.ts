import { todo } from "../../tools";
import AlphabetVPA, { ALPHABET_TYPE, ALPH_TYPE_LIST } from "./AlphabetVPA";

type transition = {
  INT: { [letter: string]: StateVPA[] },
  CALL: { [letter: string]: { successors: StateVPA[], symbolToPush: string } },
  RET: { [letter: string]: { [stackTop: string]: StateVPA[] } }
}

export default class StateVPA {
  isAccepting: boolean;
  isInitial: boolean;
  alphabet: AlphabetVPA;
  private outTransitions: transition;
  inTransitions: transition;
  private successors: Set<StateVPA>;
  private predecessors: Set<StateVPA>;
  private mapAlphSymbolToType: Map<String, ALPHABET_TYPE>
  name: string;
  stackAlphabet: string[];

  /**
   * `isAccepting` and `isInitial` are _optional_ and if not specified
   * are supposed to be _false_
   */
  constructor(p: { name: string, isAccepting?: boolean, isInitial?: boolean, alphabet: AlphabetVPA, stackAlphabet: string[] }) {
    if (p.stackAlphabet.join().match(/{|}/)) {
      throw new Error("Stack alphabet should not contain curly brackets")
    }
    this.name = p.name;
    this.stackAlphabet = p.stackAlphabet;
    this.isAccepting = p.isAccepting || false;
    this.isInitial = p.isInitial || false;
    this.alphabet = p.alphabet.clone();
    this.outTransitions = { INT: {}, CALL: {}, RET: {} };
    this.inTransitions = { INT: {}, CALL: {}, RET: {} };
    this.successors = new Set();
    this.predecessors = new Set();
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

  addTransition(p: { type?: ALPHABET_TYPE, symbol: string, topStack?: string, successor: StateVPA }) {
    if (p.successor === undefined)
      throw new Error("p.successor is undefined !")
    p.topStack = p.topStack || undefined
    let succ: StateVPA[] = [], pred: StateVPA[] = [];
    p.type = p.type || this.mapAlphSymbolToType.get(p.symbol)!
    if (p.topStack && !this.stackAlphabet.includes(p.topStack))
      this.stackAlphabet.push(p.topStack)

    if (this.mapAlphSymbolToType.has(p.symbol) &&
      p.type !== this.mapAlphSymbolToType.get(p.symbol))
      throw new Error(`You can't add a transition of type ${p.type} with symbol ${p.symbol}, because ${p.symbol} belongs is of type ${this.mapAlphSymbolToType.get(p.symbol)}`)

    if (p.type === undefined)
      throw new Error(`You must specify the type of Alphabet for ${p.symbol} since it is not known, current alphabet is : ${this.alphabet.toString()}`)

    if (!this.mapAlphSymbolToType.has(p.symbol))
      this.mapAlphSymbolToType.set(p.symbol, p.type)

    switch (p.type) {
      case "INT": {
        succ = (this.outTransitions.INT[p.symbol] = this.outTransitions.INT[p.symbol] || [])
        pred = (p.successor.inTransitions.INT[p.symbol] = p.successor.inTransitions.INT[p.symbol] || [])
        break;
      }
      case "RET": {
        if (p.topStack === undefined)
          throw new Error("Top stack should not be undefined")
        let succ1, pred1;
        succ1 = (this.outTransitions.RET[p.symbol] = (this.outTransitions.RET[p.symbol] || {}))
        pred1 = (p.successor.inTransitions.RET[p.symbol] = (p.successor.inTransitions.RET[p.symbol] || {}))
        succ = (succ1[p.topStack] = (succ1[p.topStack] || []))
        pred = (pred1[p.topStack] = (pred1[p.topStack] || []))
        break;
      }
      case "CALL": {
        if (p.topStack === undefined)
          throw new Error("Top stack should not be undefined")

        let succ1: { successors: StateVPA[], symbolToPush: string },
          pred1: { successors: StateVPA[], symbolToPush: string };
        succ1 = (this.outTransitions.CALL[p.symbol] = (this.outTransitions.CALL[p.symbol] ||
          { successors: [], symbolToPush: p.topStack }))
        pred1 = (p.successor.inTransitions.CALL[p.symbol] = (p.successor.inTransitions.CALL[p.symbol] || { successors: [], symbolToPush: p.topStack }))
        pred1.symbolToPush = p.topStack;
        pred = pred1.successors
        succ1.symbolToPush = p.topStack;
        succ = succ1.successors;
        break;
      }
    }

    if ((succ.length === 0 || pred.length === 0) && !this.alphabet[p.type].includes(p.symbol)) {
      this.alphabet[p.type].push(p.symbol)
    }

    this.successors.add(p.successor)
    p.successor.predecessors.add(this)

    succ.push(p.successor)
    pred.push(this)

    return succ
  }

  getSuccessor(p: { type?: ALPHABET_TYPE, symbol: string, topStack?: string, stack?: string[] }): StateVPA[] {
    p.type = p.type || this.mapAlphSymbolToType.get(p.symbol)
    if (p.type === undefined)
      throw new Error(`You should specify a type for this symbol : ${p.symbol}`)

    try {
      switch (p.type) {
        case "INT":
          return this.outTransitions[p.type][p.symbol]
        case "CALL": {
          let tr = this.outTransitions[p.type][p.symbol]
          if (p.stack) {
            p.stack.push(tr.symbolToPush);
          }
          // else console.warn("Attention, you are looking for a call transition, but you do not provide a stack to make the push operation")
          return tr.successors
        }
        case "RET": {
          if (p.topStack) return this.outTransitions[p.type][p.symbol][p.topStack]
          if (p.stack && p.stack.length > 0) {
            let top = p.stack.pop()!
            return this.outTransitions[p.type][p.symbol][top]
          }
        }
      }
    } catch (e) {
      return []
    }
    throw new Error(`The top stack symbol should be specified for ${p.symbol} for a ${p.type} transitions`)
  }

  getPredecessor(p: { type?: ALPHABET_TYPE, symbol: string, topStack?: string }) {
    let type = p.type || this.mapAlphSymbolToType.get(p.symbol)
    try {
      if (type === undefined)
        throw new Error(`You should specify a type for this symbol : ${p.symbol}`)
      if (type === "INT")
        return this.inTransitions["INT"][p.symbol]
      if (type === "CALL")
        return this.inTransitions["CALL"][p.symbol].successors
      if (p.topStack)
        return this.inTransitions["RET"][p.symbol][p.topStack]
    } catch (e) {
      return []
    }
    throw new Error(`The top stack symbol should be specified for ${p.symbol}`)
  }


  getOutTransitionNumber(): number {
    return todo()
  }

  getAllSuccessors() {
    return this.successors
  }

  getAllOutTransitions(): transition {
    return this.outTransitions
  }

  clone(p?: { name?: string, alphabet?: AlphabetVPA }) {
    return new StateVPA({ ...this, name: p?.name || this.name, alphabet: p?.alphabet?.union(this.alphabet) || this.alphabet })
  }

  static Bottom(alphabet: AlphabetVPA, stackAlphabet: string[]) {
    return new StateVPA({ name: "⊥", isAccepting: false, isInitial: false, alphabet, stackAlphabet })
  }

  getType(symbol: string) {
    return this.mapAlphSymbolToType.get(symbol)!
  }
}