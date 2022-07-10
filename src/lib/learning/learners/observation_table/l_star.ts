import { Automaton } from "../../../automaton/fsm/DFA_NFA";
import { State } from "../../../automaton/fsm/state";
import { LearnerBase } from "./learner_base";

export class L_star extends LearnerBase {
  make_automaton(): Automaton {
    const
      word_for_state: string[] = [],
      statesMap: Map<string, State> = new Map(),
      acceptingStates: State[] = [],
      initialStates: State[] = [],
      statesSet: Set<State> = new Set();
    this.ot.S.forEach(s => {
      let name = this.ot.assoc[s];
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
      let name = this.ot.assoc[word]
      for (const symbol of this.alphabet) {
        statesMap.get(name)!.add_transition(symbol, statesMap.get(this.ot.assoc[word + symbol])!)
      }
    }

    this.automaton = new Automaton(statesSet);
    return this.automaton;
  }

  /**
   * @returns the first t in SA st it does not exist s in S st row(s) === row (t)
   */
  is_close(): string | undefined {
    let res = this.ot.SA.find(t => !this.ot.S.some(s => this.same_row(s, t)));
    this.closedness_counter += res === undefined ? 0 : 1;
    return res;
  }

  /**
   * @returns a list of 3 elements, 
   * the first two are s1, s2 in {@link S} st row(s1) === row(s2)
   * and there is an "a" in alphabet st row(s1 + a) !== row(s2 + a)
   */
  is_consistent(): string[] | undefined {
    for (let s1_ind = 0; s1_ind < this.ot.S.length; s1_ind++) {
      for (let s2_ind = s1_ind + 1; s2_ind < this.ot.S.length; s2_ind++) {
        let s1 = this.ot.S[s1_ind];
        let s2 = this.ot.S[s2_ind];
        if (this.same_row(s1, s2)) {
          for (const a of this.alphabet) {
            for (let i = 0; i < this.ot.E.length; i++) {
              if (this.ot.assoc[s1 + a][i] !== this.ot.assoc[s2 + a][i] && !this.ot.E.includes(a + this.ot.E[i])) {
                this.consistence_counter++;
                return [s1, s2, a + this.ot.E[i]]
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