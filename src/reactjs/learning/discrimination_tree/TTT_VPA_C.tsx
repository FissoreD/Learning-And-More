import { ReactElement } from "react";
import StateVPA from "../../../lib/automaton/context_free/StateVPA";
import Clonable from "../../../lib/Clonable.interface";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import { StringCouple } from "../../../lib/learning/learners/discrimination_tree/DiscTreeVPA";
import TTT_VPA from "../../../lib/learning/learners/discrimination_tree/TTT_VPA";
import TeacherVPA from "../../../lib/learning/teachers/TeacherVPA";
import { toEps } from "../../../lib/tools";
import { createVPAxml1 } from "../../../lib/__test__/VPAforTest";
import DiscriminationTreeC from "./DiscriminationTreeC";
import TTT_Father_C from "./TTT_Father_C";

export default class TTT_VPA_C extends TTT_Father_C<StringCouple, StateVPA> {
  nodeLabelToString(n: StringCouple): string {
    return `(${toEps(n[0])},${toEps(n[1])})`
  }

  createNewLearner(regex: string): TTT_VPA {
    let res = new TTT_VPA(new TeacherVPA({ automaton: createVPAxml1() }))
    res.teacher.regex = `<xml><h1>Text</h1></xml>`
    let res1 = new TTT_VPA(new TeacherVPA({ automaton: createVPAxml1() }))
    res1.makeAllQueries()
    console.log(res1.automaton?.toDot());

    return res;
  }

  dataStructureToNodeElement(ds: Clonable): ReactElement {
    return <DiscriminationTreeC dt={ds.clone() as DiscTreeDFA} />
  }
}