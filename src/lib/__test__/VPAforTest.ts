import AlphabetVPA from "../automaton/context_free/AlphabetVPA"
import StateVPA from "../automaton/context_free/StateVPA"
import VPA from "../automaton/context_free/VPA"

/**
 * @returns a VPA st G = A^n II* B^n
 */
export let createVPA1 = (): VPA => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B", "C"], INT: ["I"] })
  let stackAlphabet = ["0"]
  let state1 = new StateVPA({ name: "1", isAccepting: true, alphabet, stackAlphabet })
  let state2 = new StateVPA({ name: "2", isInitial: true, alphabet, stackAlphabet })
  state1.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "I", successor: state1 })
  state1.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state2.addTransition({ symbol: "A", topStack: "0", successor: state2 })
  let vpa = new VPA([state1, state2])
  return vpa
}

export let createVPA2 = (): VPA => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B"], INT: ["I"] })
  let stackAlphabet = ["2"]
  let s1 = new StateVPA({ name: "3", isAccepting: true, isInitial: true, alphabet, stackAlphabet })
  s1.addTransition({ symbol: "I", successor: s1 })
  s1.addTransition({ symbol: "A", topStack: "2", successor: s1 })
  s1.addTransition({ symbol: "B", topStack: "2", successor: s1 })
  let vpa = new VPA([s1])
  return vpa
}

/**
 * @returns a VPA st G = A^n I B^n
 */
export let createVPA3 = (): VPA => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B"], INT: ["I"] })
  let stackAlphabet = ["0"]
  let state1 = new StateVPA({ name: "1", isAccepting: true, alphabet, stackAlphabet })
  let state2 = new StateVPA({ name: "2", isInitial: true, alphabet, stackAlphabet })
  state2.addTransition({ symbol: "I", successor: state1 })
  state1.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state2.addTransition({ symbol: "A", topStack: "0", successor: state2 })
  let vpa = new VPA([state1, state2])
  return vpa
}

export let createVPA4 = (): VPA => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B", "C"], INT: ["I"] })
  let stackAlphabet = ["0"]
  let state1 = new StateVPA({ name: "1", isAccepting: true, alphabet, stackAlphabet })
  let state2 = new StateVPA({ name: "2", isInitial: true, alphabet, stackAlphabet })
  state1.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state1.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state1.addTransition({ symbol: "C", topStack: "0", successor: state1 })
  state2.addTransition({ symbol: "A", topStack: "0", successor: state2 })
  let vpa = new VPA([state1, state2])
  return vpa
}