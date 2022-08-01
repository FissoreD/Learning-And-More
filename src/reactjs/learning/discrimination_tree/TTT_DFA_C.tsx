import { ReactElement } from "react";
import StateDFA from "../../../lib/automaton/regular/StateDFA";
import Clonable from "../../../lib/Clonable.interface";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TTT_DFA from "../../../lib/learning/learners/discrimination_tree/TTT_DFA";
import { TeacherAutomaton } from "../../../lib/learning/teachers/TeacherDFA";
import { toEps } from "../../../lib/tools";
import { LearnerSection, MessageType, StateReact } from "../LearnerSectionFatherC";
import DiscriminationTreeC from "./DiscriminationTreeC";

export default class TTT_C extends LearnerSection<StateDFA> {

  createNewLearner(regex: string): TTT_DFA {
    return new TTT_DFA(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  dataStructureToNodeElement(ds: Clonable): ReactElement {
    return <DiscriminationTreeC dt={ds.clone() as DiscTreeDFA} />
  }

  nextOpChild(state: StateReact<StateDFA>): StateReact<StateDFA> {
    let learner = state.learner as TTT_DFA
    if (learner.finish) return state;
    var message: { type: MessageType, val: JSX.Element };
    let oldMsg = state.memory[state.position].message
    if (state.doNext) {
      if (oldMsg.type === "CE") {
        message = { type: "HYP-STAB", val: <span>The first conjecture has been sent, but the teacher has provided the counter-example <i>{learner.lastCe?.value}</i> </span> }
      } else if (learner.toStabilizeHypothesis()) {
        message = { type: "HYP-STAB", val: <span>The counter-example should be stabilized, since the automaton does {learner.lastCe?.accepted ? "not" : ""} accept the counter-example <i>{learner.lastCe?.value}</i></span> }
      } else {
        message = { type: "SEND-HYP", val: <span><i>{learner.lastCe?.value}</i> is finally correctly placed in the automaton.<br />This automaton will be sent as a conjecture</span> }
      }
    } else {
      state.learner.makeNextQuery()
      message = { ...oldMsg };
      if (learner.finish) {
        message = { type: "END", val: <span>"The teacher has accepted the last conjecture" </span> }
      } else
        switch (oldMsg.type) {
          case "HYP-STAB": {
            let { u, v, a, uState } = learner.lastSplit!;
            [u, v, uState] = [toEps(u), toEps(v), toEps(uState)];
            message.val = <span>The counter-example can be split in (u:<b>{u}</b>, a:<b>{a}</b>, v:<b>{v}</b>) since λ(⌊{u}.{a}⌋.{v}) ≠ λ(⌊{toEps(u)}⌋.{a}.{v}). The leaf {u} is replaced with the innernode {v} and the leaf ⌊{toEps(u)}⌋.{a} = {uState}.{a} has been added</span>;
            break;
          }
          case "SEND-HYP":
            message.val = <span>The conjecture has been sent, but the teacher has provided the counter-example {learner.lastCe?.value}</span>
            break;
          case "END":
            return state
          default: throw new Error("You should not be here")
        }
    }
    let memory = state.memory;

    memory.push({
      message, dataStructure: learner.dataStructure.clone(),
      automaton: learner.makeAutomaton()!.clone()
    })
    let position = state.position + 1
    state = { position, doNext: !state.doNext, memory, learner: state.learner, showRegexDialog: false }
    return state
  }
}