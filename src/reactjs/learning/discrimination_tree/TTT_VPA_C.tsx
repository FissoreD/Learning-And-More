import { ReactElement } from "react";
import VPA from "../../../lib/automaton/context_free/VPA";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import { StringCouple } from "../../../lib/learning/learners/discrimination_tree/DiscTreeVPA";
import TTT_VPA from "../../../lib/learning/learners/discrimination_tree/TTT_VPA";
import TeacherVPA from "../../../lib/learning/teachers/TeacherVPA";
import { toEps } from "../../../lib/tools";
import DiscriminationTreeC from "./DiscriminationTreeC";
import TTT_Father_C from "./TTT_Father_C";

export default class TTT_VPA_C extends TTT_Father_C<StringCouple> {
  nodeLabelToString(n: StringCouple): string {
    return `(${toEps(n[0])},${toEps(n[1])})`
  }

  createNewLearner(regex: string | VPA): TTT_VPA {
    if (typeof regex === "string")
      throw new Error("Unable to transform string to VPA")
    let res = new TTT_VPA(new TeacherVPA({ automaton: regex }))
    return res;
  }

  dataStructureToNodeElement(ds: DiscTreeDFA): ReactElement {
    return <DiscriminationTreeC dt={ds.clone()} />
  }
}