import TTT_Father from "../../../lib/learning/learners/discrimination_tree/TTT_Father";
import { toEps } from "../../../lib/tools";
import { LearnerSection, MessageType, StateReact } from "../LearnerFatherC";

export default abstract class TTT_Father_C<LblType, StateType> extends LearnerSection {
  nextOpChild(state: StateReact): StateReact {
    let learner = state.learner as TTT_Father<LblType, StateType>
    if (learner.finish) return state;
    var message: { type: MessageType, val: JSX.Element };
    let oldMsg = state.memory[state.position].message
    if (state.doNext) {
      if (oldMsg.type === "CE") {
        message = { type: "HYP-STAB", val: <span>The first conjecture has been sent, but the teacher has provided the counter-example <i>{learner.lastCe?.value}</i> </span> }
      } else if (learner.toStabilizeHypothesis()) {
        message = { type: "HYP-STAB", val: <span>The counter-example should be stabilized, since the automaton does {learner.lastCe?.accepted ? "not" : ""} accept the counter-example <i>{learner.lastCe?.value}</i></span> }
      } else {
        message = { type: "SEND-HYP", val: <span><i>{learner.lastCe?.value}</i> is correctly placed in the automaton.<br />This automaton will be sent as a conjecture</span> }
      }
    } else {
      state.learner.makeNextQuery()
      message = { ...oldMsg };
      if (learner.finish) {
        message = { type: "END", val: <span>The teacher has accepted the last conjecture</span> }
      } else
        switch (oldMsg.type) {
          case "HYP-STAB": {
            let { u, v, a, uState, newLeaf, newNodeLabel } = learner.lastSplit!;
            [u, v, uState] = [toEps(u), toEps(v), toEps(uState!)];
            message.val = <span>The counter-example can be split in (u:<b>{u}</b>, a:<b>{a}</b>, v:<b>{v}</b>) since λ(⌊{u}.{a}⌋.{v}) ≠ λ(⌊{toEps(u)}⌋.{a}.{v}). The leaf {uState} is replaced with the innernode {this.nodeLabelToString(newNodeLabel)} and the leaf {newLeaf} is added</span>
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
    state = { position, doNext: !state.doNext, memory, learner: state.learner, showRegexDialog: false, firstTime: false }
    return state
  }

  abstract nodeLabelToString(n: LblType): string;
}