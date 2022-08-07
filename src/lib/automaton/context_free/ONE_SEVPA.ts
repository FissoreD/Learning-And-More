import { toEps } from "../../tools";
import StateVPA from "./StateVPA";
import VPA from "./VPA";

export default class ONE_SEVPA extends VPA {
  constructor(stateList: Set<StateVPA> | StateVPA[], grammar = "") {
    super(stateList, grammar)
    this.addAllCallTransitions()
  }

  addAllCallTransitions() {
    let successor = this.initialStates[0]
    this.states.forEach(state =>
      this.alphabet.CALL.forEach(symbol => {
        this.isValid(state, symbol);
        state.addTransition({ successor, topStack: `(${toEps(state.name)},${toEps(symbol)})`, symbol });
      }))
  }

  /**
   * A ONE-SEVPA is valid if every call transition points to the initial state
   * @param state to get its successors reading a CALL symbol
   * @param symbol the CALL symbol
   */
  isValid(state: StateVPA, symbol: string) {
    let callSucc = state.getAllOutTransitions().CALL[symbol];
    if (callSucc && !callSucc.successors.includes(this.initialStates[0]) && callSucc.successors.length > 0) {
      throw new Error("In 1-SEVPA, each CALL transition should point into the initial state");
    }
  }
}