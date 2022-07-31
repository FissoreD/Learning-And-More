import { toEps } from "../../tools";
import StateVPA from "./StateVPA";
import VPA from "./VPA";

export default class ONE_SEVPA extends VPA {
  constructor(stateList: Set<StateVPA> | StateVPA[]) {
    super(stateList)
    this.addAllCallTransitions()
  }

  addAllCallTransitions() {
    let successor = this.initialStates[0]
    this.states.forEach(state =>
      this.alphabet.CALL.forEach(symbol => {
        { // Check SEVPA validity
          let callSucc = state.getAllOutTransitions().CALL[symbol]
          if (callSucc && !callSucc.successors.includes(successor) && callSucc.successors.length > 0) {
            throw new Error("In 1-SEVPA, each CALL transition should point into the initial state")
          }
        }
        state.addTransition({ successor, topStack: `(${toEps(symbol)},${toEps(state.name)})`, symbol })
      }))
  }
}