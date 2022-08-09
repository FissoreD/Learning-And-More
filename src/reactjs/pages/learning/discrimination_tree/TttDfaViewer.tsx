import { ReactElement } from "react";
import DFA_NFA from "../../../../lib/automaton/regular/DFA_NFA";
import DiscTreeDFA from "../../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TttDfa from "../../../../lib/learning/learners/discrimination_tree/TttDfa";
import TeacherDFA from "../../../../lib/learning/teachers/TeacherDFA";
import DiscriminationTreeViewer from "./DiscriminationTreeViewer";
import TttFatherViewer from "./TttFatherViewer";

export default class TttDfaViewer extends TttFatherViewer<string> {
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