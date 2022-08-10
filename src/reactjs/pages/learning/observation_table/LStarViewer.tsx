import { connect } from "react-redux";
import DFA_NFA from "../../../../lib/automaton/regular/DFA_NFA";
import { default as LStar, default as L_Star } from "../../../../lib/learning/learners/observation_table/LStar";
import TeacherDFA from "../../../../lib/learning/teachers/TeacherDFA";
import { toEps } from "../../../../lib/tools";
import { mapMethodToPropsLearner, mapStateToPropsLearner, PropReactLearnerViewer } from "../LearnerViewer";
import LearnerObsTableFatherViewer from "./LearnerObsTableFatherViewer";

class LStarViewer extends LearnerObsTableFatherViewer {
  createNewLearner(regex: string | DFA_NFA): L_Star {
    return new L_Star(new TeacherDFA({ type: regex instanceof DFA_NFA ? "Automaton" : "Regex", automaton: regex }))
  }

  constructor(prop: PropReactLearnerViewer) {
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

export default connect(mapStateToPropsLearner(
  (regex: string) => new LStar(new TeacherDFA({ automaton: regex, type: "Regex" })), "L*"), mapMethodToPropsLearner)(LStarViewer)