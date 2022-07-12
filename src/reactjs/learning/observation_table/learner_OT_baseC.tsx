import { ReactElement } from "react";
import LearnerOTBase from "../../../lib/learning/learners/observation_table/learner_ot_base";
import { AutomatonC } from "../../automaton/automaton";
import { LearnerSection, MessageType, PropReact, StateReact } from "../learner_sectionC";
import { ObservationTableC } from "./observation_table_c";

export default abstract class LearnerOTBaseC extends LearnerSection<LearnerOTBase>{
  table_to_modify_after_ce: string;
  constructor(prop: PropReact<LearnerOTBase>, table_to_modif: string) {
    super(prop)
    this.table_to_modify_after_ce = table_to_modif

  }
  dataStructureToNodeElement(): ReactElement {
    return <ObservationTableC data_structure={this.props.learner.data_structure} />
  }

  abstract close_message(close_rep: string): string;
  abstract consistent_message(s1: string, s2: string, new_col: string): string;

  next_op_child(state: StateReact): StateReact {
    let learner = this.props.learner;
    if (learner.finish) return state
    var message: { type: MessageType, val: string };
    if (state.do_next) {
      let prop;
      if ((prop = learner.is_close())) {
        message = { type: "CLOSEDNESS", val: this.close_message(prop) }
      } else if ((prop = learner.is_consistent())) {
        message = {
          type: "CONSISTENCY", val: this.consistent_message(prop[0], prop[1], prop[2])
        }
      } else if ((prop = learner.counter_example)) {
        message = {
          type: "CE", val: "Received the counter-example " + prop
        }
      } else if (learner.finish || learner.automaton !== undefined) {
        message = {
          type: "END", val: "The teacher has accepted the laste conjecture"
        }
      } else {
        message = {
          type: "SEND-HYP", val: "The table is closed and consistent"
        }
      }
    } else {
      this.props.learner.make_next_query()

      let old_msg = state.memory[state.position].message
      message = { ...old_msg };
      switch (old_msg.type) {
        case "CONSISTENCY":
        case "CLOSEDNESS":
          message.val = "The table has been modified"; break;
        case "CE":
          message.val = "The counter-example has been added in " + this.table_to_modify_after_ce; break;
        case "SEND-HYP":
          message.val = "The conjecture has been sent to the Teacher"; break;
        case "END":
          return state
        default: throw new Error("You should not be here")
      }
    }
    let memory = state.memory;
    memory.push({
      message, dataStructure: <ObservationTableC data_structure={learner.data_structure.clone()} />,
      automaton: learner.automaton ? <AutomatonC automaton={learner.automaton.clone()} /> : undefined
    })
    let position = state.position + 1
    state = { position, do_next: !state.do_next, memory }
    return state
  }
}