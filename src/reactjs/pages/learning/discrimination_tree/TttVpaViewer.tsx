import { ReactElement } from "react";
import VPA from "../../../../lib/automaton/context_free/VPA";
import DiscTreeDFA from "../../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TttVpa from "../../../../lib/learning/learners/discrimination_tree/TttVpa";
import TeacherVPA from "../../../../lib/learning/teachers/TeacherVPA";
import { toEps } from "../../../../lib/tools";
import DiscriminationTreeViewer from "./DiscriminationTreeViewer";
import TttFatherViewer from "./TttFatherViewer";

export default class TttVpaViewer extends TttFatherViewer<StringCouple> {
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