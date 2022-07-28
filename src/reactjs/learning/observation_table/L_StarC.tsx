import StateDFA from "../../../lib/automaton/regular/StateDFA";
import Learner_OT_Abstract from "../../../lib/learning/learners/observation_table/Learner_OT_Abstract";
import L_Star from "../../../lib/learning/learners/observation_table/L_star";
import { TeacherAutomaton } from "../../../lib/learning/teachers/TeacherDFA";
import { toEps } from "../../../lib/tools";
import { PropReact } from "../LearnerSectionC";
import Learner_OT_AbstractC from "./Learner_OT_AbstractC";

export default class LStarC extends Learner_OT_AbstractC {
  createNewLearner(regex: string): L_Star {
    return new L_Star(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  constructor(prop: PropReact<string[], StateDFA, Learner_OT_Abstract>) {
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