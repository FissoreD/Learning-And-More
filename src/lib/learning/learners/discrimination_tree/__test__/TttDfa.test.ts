import aut from "../../../../../json/automata.json";
import TeacherDFA from "../../../teachers/TeacherDFA";
import TttDfa from "../TttDfa";

test("TTT learn a+bb", () => {
  let t = new TeacherDFA({ type: "Regex", automaton: "a+bb" })
  let learner = new TttDfa(t);

  expect(learner.getDataStructure().sift("aaa", t)?.name).toBe("")
  expect(learner.getDataStructure().sift("aab", t)?.name).toBe("")
  expect(learner.getDataStructure().sift("bba", t)?.name).toBe("")
  expect(learner.getDataStructure().sift("bb", t)?.name).toBe("a")
  expect(learner.getDataStructure().sift("a", t)?.name).toBe("a")

  expect(learner.makeAutomaton().acceptWord("a")).toBeTruthy()
  expect(learner.makeAutomaton().acceptWord("bb")).toBeFalsy()

  learner.makeAllQueries()
  expect(learner.finish).toBeTruthy()
})

test("TTT learn (a+b)*a(a+b)^2", () => {
  aut.regex.filter((_, pos) => pos === 1).forEach(regex => {
    let t = new TeacherDFA({ type: "Regex", automaton: regex })
    let learner = new TttDfa(t)
    learner.makeAllQueries()
    expect(t.automaton.sameLanguage(learner.automaton!)).toBeTruthy()
    expect(learner.finish).toBeTruthy()
  })
})