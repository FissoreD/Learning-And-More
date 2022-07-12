import aut from "../../../json/automata.json"
import Automaton from "../../../lib/automaton/fsm/DFA_NFA"
import TTT from "../../../lib/learning/learners/discrimination_tree/TTT"
import { TeacherAutomaton } from "../../../lib/learning/teachers/teacher_automaton"

test("TTT learn a+bb", () => {
  let t = new TeacherAutomaton({ automaton: Automaton.strToAutomaton(aut.a_or_bb) })
  let learner = new TTT(t);

  expect(learner.data_structure.sift("aaa", t)?.name).toBe("")
  expect(learner.data_structure.sift("aab", t)?.name).toBe("")
  expect(learner.data_structure.sift("bba", t)?.name).toBe("")
  expect(learner.data_structure.sift("bb", t)?.name).toBe("a")
  expect(learner.data_structure.sift("a", t)?.name).toBe("a")

  console.log(learner.data_structure.toString());
  console.log([...learner.data_structure.get_leaves().values()].filter(e => e.is_accepting).map(e => e.name));
  console.log(learner.make_automaton().toString());

  expect(learner.make_automaton().accept_word("a")).toBeTruthy()
  expect(learner.make_automaton().accept_word("bb")).toBeFalsy()

  learner.make_next_query()
  learner.make_next_query()
  learner.make_next_query()
  learner.make_next_query()

  expect(learner.finish).toBeTruthy()
})

test("TTT learn (a+b)*a(a+b)^5", () => {
  let t = new TeacherAutomaton({ automaton: Automaton.strToAutomaton(aut["(a+b)*a(a+b)^4"]) })
  let learner = new TTT(t)
  learner.make_all_queries()
  expect(t.automaton.same_language(learner.automaton!)).toBeTruthy()
  expect(learner.finish).toBeTruthy()
})