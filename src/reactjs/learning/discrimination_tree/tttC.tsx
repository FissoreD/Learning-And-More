import { ReactElement } from "react";
import TTT from "../../../lib/learning/learners/discrimination_tree/TTT";
import { todo } from "../../../lib/tools";
import { AutomatonC } from "../../automaton/automaton";
import { LearnerSection, MessageType, StateReact } from "../learner_sectionC";
import DiscriminationTreeC from "./discrimination_tree_c";

export default class TTTC extends LearnerSection<TTT> {
  dataStructureToNodeElement(): ReactElement {
    return <DiscriminationTreeC dt={this.props.learner.data_structure} />
  }

  next_op_child(state: StateReact): StateReact {
    let learner = this.props.learner
    if (learner.finish) return state;
    var message: { type: MessageType, val: string };
    if (state.do_next) {
      if (learner.to_stabilize_hypothesis()) {
        message = { type: "HYP-STAB", val: "The hypothesis is not stable since " + learner.last_ce!.value + ` should ${learner.last_ce!.accepted ? "not" : ""} be accepted` }
      } else {
        message = { type: "SEND-HYP", val: "The automaton is stable and will be sent to the teacher" }
      }
    } else {
      todo()
      this.props.learner.make_next_query()
      let old_msg = state.memory[state.position].message
      message = { ...old_msg };
      switch (old_msg.type) {
        case "CLOSEDNESS":
          message.val = "The table has been modified"; break;
        case "CE":
          message.val = "The counter-example has been added in the discrimination tree"; break;
        case "SEND-HYP":
          message.val = "The conjecture has been sent to the Teacher"; break;
        case "END":
          return state
        default: throw new Error("You should not be here")
      }
    }
    let memory = state.memory;
    memory.push({
      message, dataStructure: <DiscriminationTreeC dt={learner.data_structure.clone()} />,
      automaton: learner.automaton ? <AutomatonC automaton={learner.automaton.clone()} /> : undefined
    })
    let position = state.position + 1
    state = { position, do_next: !state.do_next, memory }
    return state
  }
}