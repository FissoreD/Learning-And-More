import { ReactElement } from "react";
import TTT from "../../../lib/learning/learners/discrimination_tree/TTT";
import { todo } from "../../../lib/tools";
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

    } else {
      this.props.learner.make_next_query()
      let old_msg = state.memory[state.position].message
      message = { ...old_msg };
      switch (old_msg.type) {
        case "CONSISTENCY":
        case "CLOSEDNESS":
          message.val = "The table has been modified"; break;
        case "CE":
          message.val = "The counter-example has been added in S"; break;
        case "CL_AND_CON":
          message.val = "The conjecture has been sent to the Teacher"; break;
        case "END":
          return state
      }
    }
    return todo()
  }
}