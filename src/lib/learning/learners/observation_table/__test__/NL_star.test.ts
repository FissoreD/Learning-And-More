import aut from "../../../../../json/automata.json";
import DFA_NFA from "../../../../automaton/regular/DFA_NFA";
import { TeacherAutomaton } from "../../../teachers/TeacherDFA";
import NL_star from "../NL_Star";

test("Learner NL-Star Bollig et al", () => {
  aut.regex.forEach(regex => {
    let automaton = DFA_NFA.regexToAutomaton(regex)
    let teacher = new TeacherAutomaton({ type: "Automaton", automaton })
    let learner = new NL_star(teacher)
    learner.makeAllQueries()
    expect(learner.automaton!.sameLanguage(automaton));
  })
})

