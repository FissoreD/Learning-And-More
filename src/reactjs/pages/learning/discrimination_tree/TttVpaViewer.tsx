import { ReactElement } from "react";
import { connect } from "react-redux";
import VPA from "../../../../lib/automaton/context_free/VPA";
import DiscTreeDFA from "../../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TttVpa from "../../../../lib/learning/learners/discrimination_tree/TttVpa";
import TeacherVPA from "../../../../lib/learning/teachers/TeacherVPA";
import { toEps } from "../../../../lib/tools";
import { VPAList } from "../../../../lib/__test__/VPAforTest";
import { mapMethodToPropsLearner, mapStateToPropsLearner } from "../LearnerViewer";
import DiscriminationTreeViewer from "./DiscriminationTreeViewer";
import TttFatherViewer from "./TttFatherViewer";

class TttVpaViewer extends TttFatherViewer<StringCouple> {
  nodeLabelToString(n: StringCouple): string {
    return `(${toEps(n[0])},${toEps(n[1])})`
  }

  createNewLearner(regex: string | VPA): TttVpa {
    return new TttVpa(new TeacherVPA({
      automaton: regex instanceof VPA ? regex : VPAList[parseInt(regex)]
    }))
  }

  dataStructureToNodeElement(ds: DiscTreeDFA): ReactElement {
    return <DiscriminationTreeViewer dt={ds.clone()} />
  }
}

export default connect(mapStateToPropsLearner(
  (regex: string) => new TttVpa(new TeacherVPA({ automaton: VPAList[parseInt(regex)] })), "TTT-VPA"), mapMethodToPropsLearner)(TttVpaViewer)