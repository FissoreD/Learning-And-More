import { ReactElement } from "react";
import StateDFA from "../../../lib/automaton/regular/StateDFA";
import Clonable from "../../../lib/Clonable.interface";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TTT_DFA from "../../../lib/learning/learners/discrimination_tree/TTT_DFA";
import { TeacherAutomaton } from "../../../lib/learning/teachers/TeacherDFA";
import DiscriminationTreeC from "./DiscriminationTreeC";
import TTT_Father_C from "./TTT_Father_C";

export default class TTT_DFA_C extends TTT_Father_C<string, StateDFA> {
  nodeLabelToString(n: string): string {
    return n;
  }

  createNewLearner(regex: string): TTT_DFA {
    return new TTT_DFA(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  dataStructureToNodeElement(ds: Clonable): ReactElement {
    return <DiscriminationTreeC dt={ds.clone() as DiscTreeDFA} />
  }
}