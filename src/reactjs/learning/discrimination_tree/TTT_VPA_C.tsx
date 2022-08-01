import { ReactElement } from "react";
import StateVPA from "../../../lib/automaton/context_free/StateVPA";
import Clonable from "../../../lib/Clonable.interface";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TTT_VPA from "../../../lib/learning/learners/discrimination_tree/TTT_VPA";
import TeacherVPA from "../../../lib/learning/teachers/TeacherVPA";
import { todo, toEps } from "../../../lib/tools";
import { LearnerSection, MessageType, StateReact } from "../LearnerSectionFatherC";
import DiscriminationTreeC from "./DiscriminationTreeC";

export default class TTT_VPA_C extends LearnerSection<StateVPA> {
  createNewLearner(regex: string): TTT_VPA {
    return new TTT_VPA(new TeacherVPA({ automaton: todo() }))
  }

  dataStructureToNodeElement(ds: Clonable): ReactElement {
    return <DiscriminationTreeC dt={ds.clone() as DiscTreeDFA} />
  }

  nextOpChild(state: StateReact<StateVPA>): StateReact<StateVPA> {
    let learner = state.learner as TTT_VPA
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