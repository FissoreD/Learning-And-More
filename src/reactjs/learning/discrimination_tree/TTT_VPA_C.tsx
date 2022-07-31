import { ReactElement } from "react";
import StateVPA from "../../../lib/automaton/context_free/StateVPA";
import Clonable from "../../../lib/Clonable.interface";
import DiscTreeDFA from "../../../lib/learning/learners/discrimination_tree/DiscTreeDFA";
import TTT_VPA from "../../../lib/learning/learners/discrimination_tree/TTT_VPA";
import TeacherVPA from "../../../lib/learning/teachers/TeacherVPA";
import { todo } from "../../../lib/tools";
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
    var message: { type: MessageType, val: string };
    if (state.doNext) {
      if (learner.toStabilizeHypothesis()) {
        message = { type: "HYP-STAB", val: "The hypothesis is not stable since " + learner.lastCe!.value + ` should ${!learner.lastCe!.accepted ? "not" : ""} be accepted.\n` + learner.splitToString() }
      } else {
        message = { type: "SEND-HYP", val: `${learner.lastCe?.value} is finally correctly placed in the automaton.\nThis automaton will be sent as a conjecture` }
      }
    } else {
      state.learner.makeNextQuery()
      let oldMsg = state.memory[state.position].message
      message = { ...oldMsg };
      if (learner.finish) {
        message = { type: "END", val: "The teacher has accepted the last conjecture" }
      } else
        switch (oldMsg.type) {
          case "HYP-STAB": {
            message.val = `The conjecture should be stabilized.\n Note: ${learner.lastCe?.value} is still ${!learner.lastCe?.accepted ? "" : "not"} accepted by the hypotheses.`
            break;
          }
          case "SEND-HYP":
            message.val = "The conjecture has been sent, but the teacher has provided the counter-example " + learner.lastCe?.value
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