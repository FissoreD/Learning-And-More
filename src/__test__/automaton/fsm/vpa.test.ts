import { StateVPA } from "../../../lib/automaton/fsm/state_vpa";
import { VPA } from "../../../lib/automaton/fsm/VPA";

/**
 * Return a VPA where :  
 * 
 */
let make_vpa = (): VPA => {
  let alphabet = { CALL: ["A"], RET: ["B", "C"], INT: ["I"] }
  let stack_alphabet = ["0"]
  let state1 = new StateVPA({ name: "state1", isAccepting: true, alphabet, stack_alphabet })
  let state2 = new StateVPA({ name: "state2", isInitial: true, alphabet, stack_alphabet })
  state1.add_transition({ symbol: "I", successor: state1 })
  state2.add_transition({ symbol: "I", successor: state1 })
  state2.add_transition({ symbol: "B", top_stack: "0", successor: state1 })
  state1.add_transition({ symbol: "B", top_stack: "0", successor: state1 })
  state2.add_transition({ symbol: "A", top_stack: "0", successor: state2 })
  let vpa = new VPA([state1, state2])
  return vpa
}

test("State VPA creation", () => {
  let alphabet = { CALL: ["A"], RET: ["B", "C"], INT: ["I"] }
  let stack_alphabet = ["0", "1"]
  let state1 = new StateVPA({ name: "state1", alphabet, stack_alphabet })
  let state2 = new StateVPA({ name: "state2", alphabet, stack_alphabet })
  state1.add_transition({ symbol: "I", successor: state1 })
  state2.add_transition({ symbol: "I", successor: state1 })
  state2.add_transition({ symbol: "B", top_stack: "0", successor: state1 })
  state2.add_transition({ symbol: "A", top_stack: "0", successor: state1 })
  state2.add_transition({ symbol: "A", top_stack: "0", successor: state1 })

  // TESTING INT
  expect(state1.getSuccessor({ symbol: "I" })[0]).toBe(state1)
  expect(state2.getSuccessor({ symbol: "I" })[0]).toBe(state1)
  expect(state1.getPredecessor({ symbol: "I" }).includes(state1)).toBeTruthy()
  expect(state1.getPredecessor({ symbol: "I" }).includes(state2)).toBeTruthy()

  // TESTING RET
  expect(state2.getSuccessor({ symbol: "B", top_stack: "0" })[0]).toBe(state1)
  expect(state1.getPredecessor({ symbol: "B", top_stack: "0" })[0]).toBe(state2)

  // Not existing transition (should return an empty list)
  expect(state1.getSuccessor({ symbol: "C", top_stack: "0" }).length === 0).toBeTruthy()
})

test("VPA to DOT", () => {
  console.log(make_vpa().toDot());
})

test("VPA to DOT", () => {
  let vpa = make_vpa()
  vpa.complete()
  console.log(vpa.toDot());
})

test("Word membership VPA", () => {
  let vpa = make_vpa()
  expect(vpa.accept_word("AAAIBIIII")).toBeFalsy()
  expect(vpa.accept_word("AAAIBIIIIBB")).toBeTruthy()
  expect(vpa.accept_word("AAAIBIIIIB")).toBeFalsy();
  expect(vpa.accept_word("AAAIBIIIIBBB")).toBeFalsy();
  expect(vpa.accept_word("I")).toBeTruthy()
  expect(vpa.accept_word("AB")).toBeTruthy()
})