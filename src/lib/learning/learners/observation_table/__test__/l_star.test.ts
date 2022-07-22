import aut from "../../../../../json/automata.json";
import DFA_NFA from "../../../../automaton/regular/DFA_NFA";
import { TeacherAutomaton } from "../../../teachers/teacher_automaton";
import L_star from "../l_star";

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

test("Learner NL-Star Bollig et al", () => {
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

test("Learner L-Star Angluin", () => {
  let automaton = DFA_NFA.strToAutomaton(aut["(a+b)*a(a+b)^4"])
  let teacher = new TeacherAutomaton({ type: "Automaton", automaton })
  let learner = new L_star(teacher)
  for (let _a = 0; _a < 10; _a++) {
    learner.makeNextQuery()
  }
})