import aut from "../../../json/automata.json"
import TTT from "../../../lib/learning/learners/discrimination_tree/TTT"
import { TeacherAutomaton } from "../../../lib/learning/teachers/teacher_automaton"

test("TTT learn a+bb", () => {
  let t = new TeacherAutomaton({ type: "Dot", automaton: aut.a_or_bb })
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

test("TTT learn (a+b)*a(a+b)^5", () => {
  let t = new TeacherAutomaton({ type: "Dot", automaton: aut["(a+b)*a(a+b)^4"] })
  let learner = new TTT(t)
  learner.makeAllQueries()
  expect(t.automaton.sameLanguage(learner.automaton!)).toBeTruthy()
  expect(learner.finish).toBeTruthy()
})