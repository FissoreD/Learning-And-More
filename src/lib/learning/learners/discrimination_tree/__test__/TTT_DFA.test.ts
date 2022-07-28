import aut from "../../../../../json/automata.json";

import { TeacherAutomaton } from "../../../teachers/TeacherDFA";
import TTT from "../TTT_DFA";

test("TTT learn a+bb", () => {
  let t = new TeacherAutomaton({ type: "Regex", automaton: "a+bb" })
  let learner = new TTT(t);

  expect(learner.dataStructure.sift("aaa", t)?.name).toBe("")
  expect(learner.dataStructure.sift("aab", t)?.name).toBe("")
  expect(learner.dataStructure.sift("bba", t)?.name).toBe("")
  expect(learner.dataStructure.sift("bb", t)?.name).toBe("a")
  expect(learner.dataStructure.sift("a", t)?.name).toBe("a")

  expect(learner.makeAutomaton().acceptWord("a")).toBeTruthy()
  expect(learner.makeAutomaton().acceptWord("bb")).toBeFalsy()

  learner.makeAllQueries()
  expect(learner.finish).toBeTruthy()
})

test("TTT learn (a+b)*a(a+b)^2", () => {
  aut.regex.filter((_, pos) => pos === 1).forEach(regex => {
    let t = new TeacherAutomaton({ type: "Regex", automaton: regex })
    let learner = new TTT(t)
    learner.makeAllQueries()
    expect(t.automaton.sameLanguage(learner.automaton!)).toBeTruthy()
    expect(learner.finish).toBeTruthy()
  })
})

test("TEST ME", () => {
  let regex = aut.regex[0]
  let t = new TeacherAutomaton({ type: "Regex", automaton: regex })
  let learner = new TTT(t)
  learner.makeNextQuery()
  learner.makeNextQuery()
  learner.makeNextQuery()
  console.log(learner.automaton?.toDot());
})