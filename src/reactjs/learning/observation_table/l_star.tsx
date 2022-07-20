import LearnerOTBase from "../../../lib/learning/learners/observation_table/learner_ot_base";
import L_star from "../../../lib/learning/learners/observation_table/l_star";
import { TeacherAutomaton } from "../../../lib/learning/teachers/teacher_automaton";
import { toEps } from "../../../lib/tools";
import { PropReact } from "../learner_sectionC";
import LearnerOTBaseC from "./learner_OT_baseC";

export default class LStarC extends LearnerOTBaseC {

  createNewLearner(regex: string): L_star {
    return new L_star(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  constructor(prop: PropReact<LearnerOTBase>) {
    super(prop, "S")
  }

  closeMessage(closeRep: string) {
    return `The table is not closed since row(${closeRep}) is not present in S.
    "${closeRep}" will be moved from SA to S.`
  }

  consistentMessage(s1: string, s2: string, newCol: string) {
    let fstChar = newCol[0],
      sndChar = newCol.length === 1 ? "ε" : newCol.substring(1);
    return `The table is not consistent since:
    row(${toEps(s1)}) = row(${toEps(s2)}) but row(${s1 + newCol[0]}) ≠ row(${s2 + newCol[0]});
        The column "${fstChar} ∘ ${sndChar}" will be added in E since T(${toEps(s1)} ∘ ${newCol}) ≠ T(${toEps(s2)} ∘ ${newCol})`
  }
}