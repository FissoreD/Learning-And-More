import { todo } from "../../tools";
import { FSM } from "./FSM_interface";
import { AlphabetVPA, StateVPA, transition_type } from "./state_vpa";

export class VPA implements FSM<AlphabetVPA, StateVPA> {
  states: Map<string, StateVPA>;
  initialStates: StateVPA[];
  alphabet: AlphabetVPA;
  stack: string[];

  constructor(stateList: Set<StateVPA> | StateVPA[]) {
    stateList = new Set(stateList);
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));
    this.stack = []

    this.initialStates = this.all_states().filter(s => s.isInitial);
    this.alphabet = {
      CALL: [...new Set([...stateList].map(e => e.alphabet.CALL).flat())],
      RET: [...new Set([...stateList].map(e => e.alphabet.RET).flat())],
      INT: [...new Set([...stateList].map(e => e.alphabet.INT).flat())]
    };
  }

  give_state(word: string): StateVPA | undefined {
    return todo()
  }

  complete(bottom?: StateVPA | undefined): VPA {
    throw todo();
  }

  determinize(): VPA {
    throw todo();
  }

  minimize(): VPA {
    throw todo();
  }

  union(aut: VPA): VPA {
    throw todo();
  }

  intersection(aut: VPA): VPA {
    return aut.complement().union(this.complement()).complement()
  }

  difference(aut: VPA): VPA {
    return aut.union(this.complement()).complement()
  }

  symmetric_difference(aut: VPA): VPA {
    return this.difference(aut).union(aut.difference(this));
  }

  clone(): VPA {
    throw todo();
  }

  complement(): VPA {
    throw todo();
  }

  state_number(): number {
    throw this.states.size
  }

  transition_number(): number {
    throw [...this.states.values()].reduce((a, b) => a + b.get_out_transition_number(), 0)
  }

  is_deterministic(): boolean {
    throw todo();
  }

  same_language(aut: VPA): boolean {
    throw todo();
  }

  accept_word(word: string): boolean {
    if (word.length === 0)
      return this.initialStates.some(e => e.isAccepting);
    let nextStates: Set<StateVPA> = new Set(this.initialStates);
    for (let index = 0; index < word.length && nextStates.size > 0; index++) {
      let nextStates2: Set<StateVPA> = new Set();
      const symbol = word[index];
      if (!this.alphabet.CALL.includes(symbol) &&
        !this.alphabet.INT.includes(symbol) &&
        !this.alphabet.RET.includes(symbol)) {
        return false
      }
      for (const state of nextStates) {
        let next_transition = this.findTransition(state, symbol)
        if (next_transition)
          for (const nextState of next_transition) {
            nextStates2.add(nextState)
            if (index === word.length - 1 && nextState.isAccepting)
              return true && this.stack.length === 0
          }
        // Array.from(this.findTransition(state, symbol)).forEach(e => nextStates2.add(e))
      }
      nextStates = nextStates2;
    }
    return false;
  }

  is_empty(): boolean {
    return false;
  }

  is_full(): boolean {
    return false;
  }

  findTransition(state: StateVPA, symbol: string): StateVPA[] {
    let trans_type: transition_type;
    if (this.alphabet.CALL.includes(symbol)) trans_type = "CALL"
    else if (this.alphabet.RET.includes(symbol)) trans_type = "RET"
    else if (this.alphabet.INT.includes(symbol)) trans_type = "INT"
    else throw new Error("Invalid char")
    return state!.getSuccessor(trans_type, symbol, trans_type === "INT" ? "" : this.stack.pop())!
  }

  accepting_states(): StateVPA[] {
    throw [...this.states.values()].filter(e => e.isAccepting)
  }

  all_states(): StateVPA[] {
    return [...this.states.values()]
  }

  automatonToDot(): String {
    throw todo();
  }

  toString(): String {
    throw todo();
  }
}
