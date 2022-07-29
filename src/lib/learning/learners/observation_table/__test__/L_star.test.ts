import aut from "../../../../../json/automata.json";
import DFA_NFA from "../../../../automaton/regular/DFA_NFA";
import { TeacherAutomaton } from "../../../teachers/TeacherDFA";
import L_star from "../L_star";

test("Learner L-Star Angluin", () => {
  aut.regex.forEach(regex => {
    let automaton = DFA_NFA.regexToAutomaton(regex)
    let teacher = new TeacherAutomaton({ type: "Automaton", automaton })
    let learner = new L_star(teacher)
    learner.makeAllQueries()
    expect(learner.automaton!.sameLanguage(automaton));
  })
})
