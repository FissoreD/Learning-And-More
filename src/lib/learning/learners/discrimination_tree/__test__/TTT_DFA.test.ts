import aut from "../../../../../json/automata.json";
import TeacherDFA from "../../../teachers/TeacherDFA";
import TTT_DFA from "../TTT_DFA";

test("TTT learn a+bb", () => {
  let t = new TeacherDFA({ type: "Regex", automaton: "a+bb" })
  let learner = new TTT_DFA(t);

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
    let t = new TeacherDFA({ type: "Regex", automaton: regex })
    let learner = new TTT_DFA(t)
    learner.makeAllQueries()
    expect(t.automaton.sameLanguage(learner.automaton!)).toBeTruthy()
    expect(learner.finish).toBeTruthy()
  })
})