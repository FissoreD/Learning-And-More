import DFA_NFA from "../../../automaton/regular/DFA_NFA";
import State from "../../../automaton/regular/StateDFA";
import Learner_OT_Abstract from "./Learner_OT_Abstract";

export default class L_star extends Learner_OT_Abstract {
  makeAutomaton(): DFA_NFA {
    const
      wordForState: string[] = [],
      statesMap: Map<string, State> = new Map(),
      acceptingStates: State[] = [],
      initialStates: State[] = [],
      statesSet: Set<State> = new Set();
    this.dataStructure.S.forEach(s => {
      let name = this.dataStructure.assoc[s];
      if (!statesMap.get(name)) {
        let state = new State(name, name[0] === "1", s === "", this.alphabet);
        wordForState.push(s);
        if (state.isAccepting) acceptingStates.push(state)
        if (state.isInitial) initialStates.push(state)
        statesMap.set(name, state);
        statesSet.add(state)
      }
    })

    for (const word of wordForState) {
      let name = this.dataStructure.assoc[word]
      for (const symbol of this.alphabet) {
        statesMap.get(name)!.addTransition(symbol, statesMap.get(this.dataStructure.assoc[word + symbol])!)
      }
    }

    this.automaton = new DFA_NFA(statesSet);
    return this.automaton;
  }

  /**
   * @returns the first t in SA st it does not exist s in S st row(s) === row (t)
   */
  isClose(): string | undefined {
    let res = this.dataStructure.SA.find(t => !this.dataStructure.S.some(s => this.sameRow(s, t)));
    this.closednessCounter += res === undefined ? 0 : 1;
    return res;
  }

  /**
   * @returns a list of 3 elements, 
   * the first two are s1, s2 in {@link S} st row(s1) === row(s2)
   * and there is an "a" in alphabet st row(s1 + a) !== row(s2 + a)
   */
  isConsistent(): string[] | undefined {
    for (let s1_ind = 0; s1_ind < this.dataStructure.S.length; s1_ind++) {
      for (let s2_ind = s1_ind + 1; s2_ind < this.dataStructure.S.length; s2_ind++) {
        let s1 = this.dataStructure.S[s1_ind];
        let s2 = this.dataStructure.S[s2_ind];
        if (this.sameRow(s1, s2)) {
          for (const a of this.alphabet) {
            for (let i = 0; i < this.dataStructure.E.length; i++) {
              if (this.dataStructure.assoc[s1 + a][i] !== this.dataStructure.assoc[s2 + a][i] && !this.dataStructure.E.includes(a + this.dataStructure.E[i])) {
                this.consistenceCounter++;
                return [s1, s2, a + this.dataStructure.E[i]]
              }
            }
          }
        }
      }
    }
  }

  updateTableAfterEquiv(answer: string): void {
    this.addEltInS(answer, true);
  }
}