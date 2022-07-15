import React, { ReactElement } from "react";
import DiscriminationTree from "../../../lib/learning/learners/discrimination_tree/discrimination_tree";
import TTT from "../../../lib/learning/learners/discrimination_tree/TTT";
import LearningDataStructure from "../../../lib/learning/learners/learning_data_structure";
import { TeacherAutomaton } from "../../../lib/learning/teachers/teacher_automaton";
import { LearnerSection, MessageType, StateReact } from "../learner_sectionC";
import DiscriminationTreeC from "./discrimination_tree_c";

export default class TTTC extends LearnerSection<TTT> {
  create_new_learner(regex: string): TTT {
    return new TTT(new TeacherAutomaton({ type: "Regex", automaton: regex }))
  }

  dataStructureToNodeElement(ds: LearningDataStructure): ReactElement {
    return <DiscriminationTreeC dt={ds.clone() as DiscriminationTree} />
  }

  next_op_child(state: StateReact<TTT>): StateReact<TTT> {
    let learner = this.state.learner
    if (learner.finish) return state;
    var message: { type: MessageType, val: string };
    if (state.do_next) {
      if (learner.to_stabilize_hypothesis()) {
        message = { type: "HYP-STAB", val: "The hypothesis is not stable since " + learner.last_ce!.value + ` should ${!learner.last_ce!.accepted ? "not" : ""} be accepted.\n` + learner.split_to_string() }
      } else {
        message = { type: "SEND-HYP", val: `${learner.last_ce?.value} is finally correctly placed in the automaton.\nThis automaton will be sent as a conjecture` }
      }
    } else {
      this.state.learner.make_next_query()
      let old_msg = state.memory[state.position].message
      message = { ...old_msg };
      if (learner.finish) {
        message = { type: "END", val: "The teacher has accepted the last conjecture" }
      } else
        switch (old_msg.type) {
          case "HYP-STAB": {
            message.val = `The conjecture should be stabilized.\n Note: ${learner.last_ce?.value} is still ${!learner.last_ce?.accepted ? "" : "not"} accepted by the hypotheses.`
            break;
          }
          case "SEND-HYP":
            message.val = "The conjecture has been sent, but the teacher has provided the counter-example " + learner.last_ce?.value
            break;
          case "END":
            return state
          default: throw new Error("You should not be here")
        }
    }
    let memory = state.memory;

    memory.push({
      message, dataStructure: learner.data_structure.clone(),
      automaton: learner.make_automaton()!.clone()
    })
    let position = state.position + 1
    state = { position, do_next: !state.do_next, memory, learner: state.learner, show_regex_dialog: false }
    return state
  }
}