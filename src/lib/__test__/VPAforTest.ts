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

/** L = BTC w/[call=B, ret=C, int=T] */
export let createVPAxml1 = (): VPA => {
  let h1 = "B", notH1 = "C", text = "T"
  let alphabet = new AlphabetVPA({ CALL: [h1], RET: [notH1], INT: [text] })
  let stackAlphabet = ["0"]

  let state2 = new StateVPA({ name: "2", alphabet, stackAlphabet, isInitial: true })
  let state3 = new StateVPA({ name: "3", alphabet, stackAlphabet })
  let state4 = new StateVPA({ name: "4", alphabet, stackAlphabet })
  let state5 = new StateVPA({ name: "5", alphabet, stackAlphabet, isAccepting: true })

  state2.addTransition({ symbol: h1, successor: state3, topStack: "0" })
  state3.addTransition({ symbol: text, successor: state4 })
  state4.addTransition({ symbol: notH1, successor: state5, topStack: "0" })

  let vpa = new VPA([state2, state3, state4, state5])
  return vpa
}

/** L = ABTCD w/[call=AB, ret=CD, int=T] */
export let createVPAxml2 = (): VPA => {
  // let xml = "<xml>", notXml = "</xml>", h1 = "<h1>", notH1 = "</h1>", text = "Text"
  let xml = "A", notXml = "D", h1 = "B", notH1 = "C", text = "T"
  let alphabet = new AlphabetVPA({ CALL: [xml, h1], RET: [notXml, notH1], INT: [text] })
  let stackAlphabet = ["0", "1"]

  let state1 = new StateVPA({ name: "1", alphabet, stackAlphabet, isInitial: true })
  // let state2 = new StateVPA({ name: "2", alphabet, stackAlphabet })
  // let state3 = new StateVPA({ name: "3", alphabet, stackAlphabet })
  let state4 = new StateVPA({ name: "4", alphabet, stackAlphabet })
  let state5 = new StateVPA({ name: "5", alphabet, stackAlphabet })
  let state6 = new StateVPA({ name: "6", alphabet, stackAlphabet, isAccepting: true })

  state1.addTransition({ symbol: xml, successor: state1, topStack: "0" })
  state1.addTransition({ symbol: h1, successor: state1, topStack: "1" })
  state1.addTransition({ symbol: text, successor: state4 })
  state4.addTransition({ symbol: notH1, successor: state5, topStack: "1" })
  state5.addTransition({ symbol: notXml, successor: state6, topStack: "0" })

  let vpa = new VPA([state1, state4, state5, state6])
  return vpa
}