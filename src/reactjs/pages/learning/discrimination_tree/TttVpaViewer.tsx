import { ReactElement } from "react";
import { connect } from "react-redux";
import VPA from "../../../../lib/automaton/context_free/VPA";
import DiscTreeDFA from "../../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TttVpa from "../../../../lib/learning/learners/discrimination_tree/TttVpa";
import TeacherVPA from "../../../../lib/learning/teachers/TeacherVPA";
import { toEps } from "../../../../lib/tools";
import { VPAList } from "../../../../lib/__test__/VPAforTest";
import { setLearnerPos } from "../../../redux/actions/learnerAction";
import { StoreLearnerInterface } from "../../../redux/storeTypes";
import { LearnerType } from "../LearnerPage";
import DiscriminationTreeViewer from "./DiscriminationTreeViewer";
import TttFatherViewer from "./TttFatherViewer";

class TttVpaViewer extends TttFatherViewer<StringCouple> {
  nodeLabelToString(n: StringCouple): string {
    return `(${toEps(n[0])},${toEps(n[1])})`
  }

  createNewLearner(regex: string | VPA): TttVpa {
    if (typeof regex === "string")
      throw new Error("Unable to transform string to VPA")
    let res = new TttVpa(new TeacherVPA({ automaton: regex }))
    return res;
  }

  dataStructureToNodeElement(ds: DiscTreeDFA): ReactElement {
    return <DiscriminationTreeViewer dt={ds.clone()} />
  }
}

function mapStateToProps(state: StoreLearnerInterface) {
  let name = "TTT-VPA" as LearnerType
  return {
    pos: state.pos[name],
    learner: new TttVpa(new TeacherVPA({ automaton: VPAList[parseInt(state.algos["TTT-VPA"])] })),
    name: name
  }
}

function z(dispatch: Function) {
  return {
    updatePosition: (l: LearnerType, pos: number) => dispatch(setLearnerPos(l, pos)),
  }
}

export default connect(mapStateToProps, z)(TttVpaViewer)