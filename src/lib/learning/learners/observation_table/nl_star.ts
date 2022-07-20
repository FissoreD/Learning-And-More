import Automaton from "../../../automaton/fsm/DFA_NFA";
import State from "../../../automaton/fsm/state";
import Teacher from "../../teachers/teacher";
import LearnerOTBase from "./learner_ot_base";

export class NL_star extends LearnerOTBase {
  primeLines: string[];

  constructor(teacher: Teacher) {
    super(teacher);
    this.primeLines = Array.from(this.alphabet).concat("");
  }

  isPrime(rowKey: string): boolean {
    if (this.primeLines === undefined) this.primeLines = []
    let rowValue = this.dataStructure.assoc[rowKey];
    if (rowValue.length < 2 || parseInt(rowValue) === 0) return true;

    let res = "0".repeat(rowValue.length)

    Object.values(this.dataStructure.assoc).forEach(value => {
      if (value !== rowValue && this.isCovered(value, rowValue)) {
        res = this.rowUnion(res, value);
      }
    });
    return res !== rowValue;
  }

  /**
   * Given two rows, {@link row1} and {@link row2} 
   * it return the union of them, that is the logic 
   * or of them, for example : row_union(0101, 0110) 
   * returns 0111
   */
  rowUnion(row1: string, row2: string): string {
    return Array.from(row1).map((e, pos) => [e, row2.charAt(pos)].includes("1") ? "1" : "0").join("");
  }

  /**
   * returns if {@link row1} is covered by {@link row2}
   * row1 is covered if every bit of is smaller then the 
   * corresponding bit of row2. For example :
   * 01100 is covered by 01110
   * 01101 is not covered by 01110 (due to last bit of r1)
   */
  isCovered(row1: string, row2: string): boolean {
    return Array.from(row1).every((e, pos) => e <= row2.charAt(pos));
  }

  checkPrimeLines() {
    this.primeLines = [...this.dataStructure.S, ...this.dataStructure.SA].filter(l => this.isPrime(l));
  }

  addEltInS(newElt: string, afterEquiv = false) {
    super.addEltInS(newElt, afterEquiv);
    this.checkPrimeLines()
    return;
  }

  addEltIn_E(newElt: string, isAfterEquiv = false): void {
    super.addEltIn_E(newElt, isAfterEquiv);
    this.checkPrimeLines()
    return;
  }

  /**
   * @returns the first `s` in {@link SA} st `s` is a prime line and 
   * `s` is not in {@link S}
   */
  isClose(): string | undefined {
    let res = this.dataStructure.SA.find(t => !this.dataStructure.S.some(s => this.sameRow(s, t)) && this.primeLines.includes(t));
    this.closednessCounter += res === undefined ? 0 : 1
    return res
  }

  /**
   * @returns a list of 3 elements, 
   * the first two are s1, s2 in {@link S} st row(s1) is covered by row(s2)
   * and there is an "a" in alphabet st row(s1 + a) is not covered row(s2 + a)
   */
  isConsistent(): string[] | undefined {
    let testCovering = (s1: string, s2: string): string[] | undefined => {
      let value_s1 = this.dataStructure.assoc[s1];
      let value_s2 = this.dataStructure.assoc[s2];
      if (this.isCovered(value_s1, value_s2)) {
        for (const a of this.alphabet) {
          let value_s1_p = this.dataStructure.assoc[s1 + a]
          let value_s2_p = this.dataStructure.assoc[s2 + a]
          if (!this.isCovered(value_s1_p, value_s2_p)) {
            for (let i = 0; i < this.dataStructure.E.length; i++) {
              if (this.dataStructure.assoc[s1 + a][i] >
                this.dataStructure.assoc[s2 + a][i] && !this.dataStructure.E.includes(a + this.dataStructure.E[i])) {
                this.consistenceCounter++;
                return [s1, s2, a + this.dataStructure.E[i]]
              }
            }
          }
        }
        return;
      }
    }

    for (let s1_ind = 0; s1_ind < this.dataStructure.S.length; s1_ind++) {
      for (let s2_ind = s1_ind + 1; s2_ind < this.dataStructure.S.length; s2_ind++) {
        let s1 = this.dataStructure.S[s1_ind];
        let s2 = this.dataStructure.S[s2_ind];
        let test1 = testCovering(s1, s2);
        if (test1) return test1;
        let test2 = testCovering(s2, s1);
        if (test2) return test2;
      }
    }
    return;
  }

  makeAutomaton() {
    let wordForState: string[] = [], statesMap: Map<string, State> = new Map(),
      acceptingStates: State[] = [], initialStates: State[] = [], stateSet: Set<State> = new Set();
    this.primeLines.forEach(s => {
      if (this.dataStructure.S.includes(s)) {
        let name = this.dataStructure.assoc[s];
        if (!statesMap.get(name)) {
          let state = new State(name, name[0] === "1", this.isCovered(name, this.dataStructure.assoc[""]), this.alphabet);
          wordForState.push(s);
          if (state.isAccepting) acceptingStates.push(state)
          if (state.isInitial) initialStates.push(state)
          statesMap.set(name, state);
          stateSet.add(state)
        }
      }
    })
    for (const word of wordForState) {
      let name = this.dataStructure.assoc[word]
      for (const symbol of this.alphabet) {
        let rowNext = this.dataStructure.assoc[word + symbol]
        for (const [name1, state] of statesMap) {
          if (this.isCovered(name1, rowNext))
            statesMap.get(name)!.getSuccessor(symbol)!.push(state)
        }
      }
    }
    this.automaton = new Automaton(stateSet)
    return this.automaton;
  }

  updateTableAfterEquiv(answer: string): void {
    this.addEltIn_E(answer, true);
  }
}