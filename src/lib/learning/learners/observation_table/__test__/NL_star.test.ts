import DFA_NFA from "../../../../automaton/regular/DFA_NFA";
import { TeacherAutomaton } from "../../../teachers/TeacherDFA";
import NL_star from "../NL_Star";

test("Learner NL-Star Bollig et al", () => {
  let automaton = DFA_NFA.regex2automaton("a(ab)*")
  let teacher = new TeacherAutomaton({ type: "Automaton", automaton })
  let learner = new NL_star(teacher)
  learner.makeAllQueries()
  expect(learner.automaton!.sameLanguage(automaton));
})

