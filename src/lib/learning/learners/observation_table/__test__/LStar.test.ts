import aut from "../../../../../json/automata.json";
import DFA_NFA from "../../../../automaton/regular/DFA_NFA";
import TeacherDFA from "../../../teachers/TeacherDFA";
import LStar from "../LStar";

test("Learner L-Star Angluin", () => {
  aut.regex.forEach(regex => {
    let automaton = DFA_NFA.regexToAutomaton(regex)
    let teacher = new TeacherDFA({ type: "Automaton", automaton })
    let learner = new LStar(teacher)
    learner.makeAllQueries()
    expect(learner.automaton!.sameLanguage(automaton));
  })
})
