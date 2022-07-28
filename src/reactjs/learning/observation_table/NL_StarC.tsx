import StateDFA from "../../../lib/automaton/regular/StateDFA";
import NL_star from "../../../lib/learning/learners/observation_table/NL_Star";
import { TeacherAutomaton } from "../../../lib/learning/teachers/TeacherDFA";
import { toEps } from "../../../lib/tools";
import { PropReact } from "../LearnerSectionC";
import Learner_OT_AbstractC from "./Learner_OT_AbstractC";

export default class NL_StarC extends Learner_OT_AbstractC {
  createNewLearner(regex: string): NL_star {
    return new NL_star(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  constructor(prop: PropReact<StateDFA>) {
    super(prop, "E")
  }
  closeMessage(closeRep: string) {
    return `The table is not closed since row(${closeRep}) is Prime and is not present in S.
    "${closeRep}" will be moved from SA to S.`;
  }

  consistentMessage(s1: string, s2: string, newCol: string) {
    let fstChar = newCol[0],
      sndChar = newCol.length === 1 ? "ε" : newCol.substring(1);
    return `The table is not consistent since :
        row(${toEps(s1)}) ⊑ row(${toEps(s2)}) but row(${s1 + newCol[0]}) ⋢ row(${s2 + newCol[0]});
        The column "${fstChar} ∘ ${sndChar}" will be added in E since T(${toEps(s1)} ∘ ${newCol}) ⋢ T(${toEps(s2)} ∘ ${newCol})`
  }
}