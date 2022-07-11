import { FSM } from "./FSM_interface";
import { AlphabetVPA, StateVPA } from "./state_vpa";

export class VPA implements FSM<AlphabetVPA, StateVPA> {
  states: Map<string, StateVPA>;
  initialStates: StateVPA[];
  alphabet: AlphabetVPA;

  constructor(stateList: Set<StateVPA> | StateVPA[]) {
    stateList = new Set(stateList);
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));

    this.initialStates = this.all_states().filter(s => s.isInitial);
    this.alphabet = {
      CALL: [...new Set([...stateList].map(e => e.alphabet.CALL).flat())],
      RET: [...new Set([...stateList].map(e => e.alphabet.RET).flat())],
      INT: [...new Set([...stateList].map(e => e.alphabet.INT).flat())]
    };
  }


  complete(bottom?: StateVPA | undefined): VPA {
    throw new Error("Method not implemented.");
  }
  determinize(): VPA {
    throw new Error("Method not implemented.");
  }
  minimize(): VPA {
    throw new Error("Method not implemented.");
  }
  union(aut: VPA): VPA {
    throw new Error("Method not implemented.");
  }
  intersection(aut: VPA): VPA {
    throw new Error("Method not implemented.");
  }
  difference(aut: VPA): VPA {
    throw new Error("Method not implemented.");
  }
  symmetric_difference(aut: VPA): VPA {
    throw new Error("Method not implemented.");
  }
  clone(): VPA {
    throw new Error("Method not implemented.");
  }
  complement(): VPA {
    throw new Error("Method not implemented.");
  }
  state_number(): number {
    throw new Error("Method not implemented.");
  }
  transition_number(): number {
    throw new Error("Method not implemented.");
  }
  is_deterministic(): boolean {
    throw new Error("Method not implemented.");
  }
  same_language(aut: VPA): boolean {
    throw new Error("Method not implemented.");
  }
  accept_word(word: string): boolean {
    throw new Error("Method not implemented.");
  }
  is_empty(): boolean {
    throw new Error("Method not implemented.");
  }
  is_full(): boolean {
    throw new Error("Method not implemented.");
  }
  findTransition(state: StateVPA, symbol: string): StateVPA[] {
    throw new Error("Method not implemented.");
  }
  accepting_states(): StateVPA[] {
    throw new Error("Method not implemented.");
  }
  all_states(): StateVPA[] {
    throw new Error("Method not implemented.");
  }
  automatonToDot(): String {
    throw new Error("Method not implemented.");
  }
  toString(): String {
    throw new Error("Method not implemented.");
  }

}
