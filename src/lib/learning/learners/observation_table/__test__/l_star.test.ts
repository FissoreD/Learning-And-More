import DFA_NFA from "../../../../automaton/regular/DFA_NFA";
import { TeacherAutomaton } from "../../../teachers/TeacherAutomaton";
import L_star from "../L_Star";

test("Learner L-Star Angluin", () => {
  let automaton = DFA_NFA.strToAutomaton(`[0]
    a,[0]->[1]
    b,[1]->[2]
    a,[2]->[1]
    [1]`) // a(ab)*
  let teacher = new TeacherAutomaton({ type: "Automaton", automaton })
  let learner = new L_star(teacher)
  learner.makeAllQueries()
  expect(automaton.sameLanguage(learner.automaton!));
})
