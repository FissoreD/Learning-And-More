import Automaton from "../../../automaton/fsm/DFA_NFA";
import State from "../../../automaton/fsm/state";
import LearnerOTBase from "./learner_ot_base";

export class L_star extends LearnerOTBase {
  make_automaton(): Automaton {
    const
      word_for_state: string[] = [],
      statesMap: Map<string, State> = new Map(),
      acceptingStates: State[] = [],
      initialStates: State[] = [],
      statesSet: Set<State> = new Set();
    this.data_structure.S.forEach(s => {
      let name = this.data_structure.assoc[s];
      if (!statesMap.get(name)) {
        let state = new State(name, name[0] === "1", s === "", this.alphabet);
        word_for_state.push(s);
        if (state.isAccepting) acceptingStates.push(state)
        if (state.isInitial) initialStates.push(state)
        statesMap.set(name, state);
        statesSet.add(state)
      }
    })

    for (const word of word_for_state) {
      let name = this.data_structure.assoc[word]
      for (const symbol of this.alphabet) {
        statesMap.get(name)!.add_transition(symbol, statesMap.get(this.data_structure.assoc[word + symbol])!)
      }
    }

    this.automaton = new Automaton(statesSet);
    return this.automaton;
  }

  /**
   * @returns the first t in SA st it does not exist s in S st row(s) === row (t)
   */
  is_close(): string | undefined {
    let res = this.data_structure.SA.find(t => !this.data_structure.S.some(s => this.same_row(s, t)));
    this.closedness_counter += res === undefined ? 0 : 1;
    return res;
  }

  /**
   * @returns a list of 3 elements, 
   * the first two are s1, s2 in {@link S} st row(s1) === row(s2)
   * and there is an "a" in alphabet st row(s1 + a) !== row(s2 + a)
   */
  is_consistent(): string[] | undefined {
    for (let s1_ind = 0; s1_ind < this.data_structure.S.length; s1_ind++) {
      for (let s2_ind = s1_ind + 1; s2_ind < this.data_structure.S.length; s2_ind++) {
        let s1 = this.data_structure.S[s1_ind];
        let s2 = this.data_structure.S[s2_ind];
        if (this.same_row(s1, s2)) {
          for (const a of this.alphabet) {
            for (let i = 0; i < this.data_structure.E.length; i++) {
              if (this.data_structure.assoc[s1 + a][i] !== this.data_structure.assoc[s2 + a][i] && !this.data_structure.E.includes(a + this.data_structure.E[i])) {
                this.consistence_counter++;
                return [s1, s2, a + this.data_structure.E[i]]
              }
            }
          }
        }
      }
    }
  }

  table_to_update_after_equiv(answer: string): void {
    this.add_elt_in_S(answer, true);
  }
}