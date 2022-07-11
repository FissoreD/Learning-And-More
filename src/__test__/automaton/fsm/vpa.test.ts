import { StateVPA } from "../../../lib/automaton/fsm/state_vpa";

test("State VPA creation", () => {
  let alphabet = { CALL: ["A"], RET: ["B", "C"], INT: ["-"] }
  let stack_alphabet = ["0", "1"]
  let state1 = new StateVPA("state1", false, true, alphabet, stack_alphabet)
  let state2 = new StateVPA("state2", false, true, alphabet, stack_alphabet)
  state1.add_transition("INT", "-", undefined, state1)
  state2.add_transition("INT", "-", undefined, state1)
  state2.add_transition("RET", "B", "0", state1)

  // TESTING INT
  expect(state1.getSuccessor("INT", "-")[0]).toBe(state1)
  expect(state2.getSuccessor("INT", "-")[0]).toBe(state1)
  expect(state1.getPredecessor("INT", "-").includes(state1)).toBeTruthy()
  expect(state1.getPredecessor("INT", "-").includes(state2)).toBeTruthy()
  expect(state1.getPredecessor("INT", "NOT_EXISTING")).toBe(undefined)

  // TESTING RET
  expect(state2.getSuccessor("RET", "B", "0")[0]).toBe(state1)
  expect(state1.getPredecessor("RET", "B", "0")[0]).toBe(state2)

  // Not existing transition (should return an empty list)
  expect(state1.getSuccessor("RET", "C", "0").length === 0).toBeTruthy()
})