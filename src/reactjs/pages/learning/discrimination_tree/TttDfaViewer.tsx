import { ReactElement } from "react";
import { connect } from "react-redux";
import DFA_NFA from "../../../../lib/automaton/regular/DFA_NFA";
import DiscTreeDFA from "../../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TttDfa from "../../../../lib/learning/learners/discrimination_tree/TttDfa";
import TeacherDFA from "../../../../lib/learning/teachers/TeacherDFA";
import { setLearnerPos } from "../../../redux/actions/learnerAction";
import { StoreLearnerInterface } from "../../../redux/storeTypes";
import { LearnerType } from "../LearnerPage";
import DiscriminationTreeViewer from "./DiscriminationTreeViewer";
import TttFatherViewer from "./TttFatherViewer";

class TttDfaViewer extends TttFatherViewer<string> {
  nodeLabelToString(n: string): string {
    return n;
  }

  createNewLearner(regex: string | DFA_NFA): TttDfa {
    return new TttDfa(new TeacherDFA({ type: regex instanceof DFA_NFA ? "Automaton" : "Regex", automaton: regex }))
  }

  dataStructureToNodeElement(ds: DiscTreeDFA): ReactElement {
    return <DiscriminationTreeViewer dt={ds.clone()} />
  }
}

function mapStateToProps(state: StoreLearnerInterface) {
  let name = "TTT-DFA" as LearnerType
  return {
    pos: state.pos[name],
    learner: new TttDfa(new TeacherDFA({ automaton: state.algos["TTT-DFA"], type: "Regex" })),
    name: name
  }
}

function z(dispatch: Function) {
  return {
    updatePosition: (l: LearnerType, pos: number) => dispatch(setLearnerPos(l, pos)),
  }
}

export default connect(mapStateToProps, z)(TttDfaViewer)