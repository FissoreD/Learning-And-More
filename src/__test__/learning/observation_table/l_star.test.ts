import { table } from "console";
import { Automaton } from "../../../automaton/fsm/DFA_NFA";
import { L_star } from "../../../learning/learners/observation_table/l_star";
import { TeacherAutomaton } from "../../../learning/teachers/teacher_automaton";

test("L-Star", () => {
  let automaton = Automaton.strToAutomaton(`
    [0]
    a,[0]->[1]
    b,[1]->[2]
    a,[2]->[1]
    [1]
  `) // a(ab)*
  let teacher = new TeacherAutomaton({ automaton })
  let learner = new L_star(teacher)
  table(learner.observation_table)
  learner.make_next_query()
  table(learner.observation_table)
  learner.make_all_queries()
})