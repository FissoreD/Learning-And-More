import { todo } from "../../tools";

export interface AlphabetVPA { INT: string[], CALL: string[], RET: string[] }

type transition = {
  int: { [letter: string]: StateVPA[] },
  call: { [letter: string]: { [stack_top: string]: StateVPA[] } },
  ret: { [letter: string]: { [stack_top: string]: StateVPA[] } }
}

export type transition_type = "INT" | "RET" | "CALL"

export class StateVPA {
  isAccepting: boolean;
  isInitial: boolean;
  alphabet: AlphabetVPA;
  private outTransitions: transition;
  private inTransitions: transition;
  private successors: Set<StateVPA>;
  private predecessor: Set<StateVPA>;
  name: string;
  stack_alphabet: string[];

  constructor(name: string, isAccepting: boolean, isInitial: boolean, alphabet: AlphabetVPA, stack_alphabet: string[]) {
    this.name = name;
    this.stack_alphabet = stack_alphabet;
    this.isAccepting = isAccepting;
    this.isInitial = isInitial;
    this.alphabet = alphabet;
    this.outTransitions = { int: {}, call: {}, ret: {} };
    this.inTransitions = { int: {}, call: {}, ret: {} };
    this.successors = new Set();
    this.predecessor = new Set();

    for (const stack_top of stack_alphabet) {
      for (const letter of alphabet.CALL) {
        console.log({ letter, stack_top });

        this.outTransitions.call![letter] = { [stack_top]: [] }
        this.inTransitions.call![letter] = { [stack_top]: [] }
      }
      for (const letter of alphabet.CALL) {
        this.outTransitions.ret![letter] = { [stack_top]: [] }
        this.inTransitions.ret![letter] = { [stack_top]: [] }
      }
    }
    for (const letter of alphabet.INT) {
      this.outTransitions.int![letter] = []
      this.inTransitions.int![letter] = []
    }
  }

  add_transition(type_trans: transition_type, symbol: string, top_stack: string = "", state: StateVPA | undefined) {
    let succ: StateVPA[] = [], pred: StateVPA[] = [];
    if (type_trans === "INT") {
      succ = (this.outTransitions.int[symbol] = this.outTransitions.int[symbol] || [])
      if (state)
        pred = (state.inTransitions.int[symbol] = state.inTransitions.int[symbol] || [])
    } else {
      let succ1, pred1;
      if (type_trans === "CALL") {
        succ1 = (this.outTransitions.call[symbol] = (this.outTransitions.call[symbol] || {}))
        if (state)
          pred1 = (state.inTransitions.call[symbol] = (state.inTransitions.call[symbol] || {}))
      } else {
        succ1 = (this.outTransitions.ret[symbol] = (this.outTransitions.ret[symbol] || {}))
        if (state)
          pred1 = (state.inTransitions.ret[symbol] = (state.inTransitions.ret[symbol] || {}))
      }
      succ = (succ1[top_stack] = (succ1[top_stack] || []))
      if (pred1)
        pred = (pred1[top_stack] = (pred1[top_stack] || []))
    }
    if (state) {
      if (succ.length === 0 || pred?.length === 0) {
        switch (type_trans) {
          case "CALL": this.alphabet.CALL.push(symbol); break
          case "RET": this.alphabet.RET.push(symbol); break;
          case "INT": this.alphabet.INT.push(symbol); break;
        }
      }
      this.successors.add(state)
      state.predecessor.add(this)
      succ.push(state)
      pred.push(this)
    }
    return succ
  }

  getSuccessor(type_trans: transition_type, symbol: string, stack_top: string = "") {
    try {
      switch (type_trans) {
        case "CALL": return this.outTransitions.call[symbol][stack_top]
        case "RET": return this.outTransitions.ret[symbol][stack_top]
        case "INT": return this.outTransitions.int[symbol]
      }
    } catch (e) {
      if (e instanceof TypeError) {
        return this.add_transition(type_trans, symbol, stack_top, undefined)
      } else throw e
    }
  }

  getPredecessor(type_trans: transition_type, symbol: string, stack_top: string = "") {
    switch (type_trans) {
      case "CALL": return this.inTransitions.call[symbol][stack_top]
      case "RET": return this.inTransitions.ret[symbol][stack_top]
      case "INT": return this.inTransitions.int[symbol]
    };
  }


  get_out_transition_number(): number {
    return todo()
  }

  get_all_successors() {
    return this.successors
  }

  get_all_out_transitions() {
    return this.outTransitions
  }

  clone(name?: string) {
    return new StateVPA(name || this.name, this.isAccepting, this.isInitial, this.alphabet, this.stack_alphabet)
  }

  static bottom(alphabet: AlphabetVPA, stack_alphabet: string[]) {
    return new StateVPA("bottom", false, false, alphabet, stack_alphabet)
  }
}