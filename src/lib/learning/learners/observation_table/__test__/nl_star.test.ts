import DFA_NFA from "../../../../automaton/regular/DFA_NFA";
import { TeacherAutomaton } from "../../../teachers/TeacherAutomaton";
import NL_star from "../NL_Star";

test("Learner NL-Star Bollig et al", () => {
  let automaton = DFA_NFA.strToAutomaton(`[0]
    a,[0]->[1]
    b,[1]->[2]
    a,[2]->[1]
    [1]`) // a(ab)*
  let teacher = new TeacherAutomaton({ type: "Automaton", automaton })
  let learner = new NL_star(teacher)
  learner.makeAllQueries()
  expect(automaton.sameLanguage(learner.automaton!));
})

