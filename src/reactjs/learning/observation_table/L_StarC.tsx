import StateDFA from "../../../lib/automaton/regular/StateDFA";
import L_Star from "../../../lib/learning/learners/observation_table/L_star";
import { TeacherAutomaton } from "../../../lib/learning/teachers/TeacherDFA";
import { toEps } from "../../../lib/tools";
import { PropReact } from "../LearnerSectionFatherC";
import Learner_OT_FatherC from "./Learner_OT_FatherC";

export default class LStarC extends Learner_OT_FatherC {
  createNewLearner(regex: string): L_Star {
    return new L_Star(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  constructor(prop: PropReact<StateDFA>) {
    super(prop, "S")
  }

  closeMessage(closeRep: string) {
    return <span>The table is not <i>closed</i> since row(<i>{closeRep}</i>) is not present in S.
      "{<i>closeRep</i>}" will be moved from <i>SA</i> to <i>S</i>.</span>
  }

  consistentMessage(s1: string, s2: string, newCol: string) {
    let fstChar = newCol[0],
      sndChar = newCol.length === 1 ? "ε" : newCol.substring(1);
    return <span>The table is not <i>consistent</i> since:
      row({toEps(s1)}) = row({toEps(s2)}) but row({s1 + newCol[0]}) ≠ row({s2 + newCol[0]});
      The column "{fstChar} ∘ {sndChar}" will be added in <i>E</i> since T({toEps(s1)} ∘ {newCol}) ≠ T({toEps(s2)} ∘ {newCol})</span>
  }
}