import { ReactElement } from "react";
import Automaton from "../../../lib/automaton/fsm/DFA_NFA";
import TTT from "../../../lib/learning/learners/discrimination_tree/TTT";
import { TeacherAutomaton } from "../../../lib/learning/teachers/teacher_automaton";
import { AutomatonC } from "../../automaton/automaton";
import { LearnerSection, MessageType, StateReact } from "../learner_sectionC";
import DiscriminationTreeC from "./discrimination_tree_c";

export default class TTTC extends LearnerSection<TTT> {
  create_new_learner(regex: string): TTT {
    return new TTT(new TeacherAutomaton({ automaton: Automaton.strToAutomaton(regex) }))
  }

  dataStructureToNodeElement(learner: TTT): ReactElement {
    return <DiscriminationTreeC dt={learner.data_structure.clone()} />
  }

  next_op_child(state: StateReact<TTT>): StateReact<TTT> {
    let learner = this.state.learner
    if (learner.finish) return state;
    var message: { type: MessageType, val: string };
    if (state.do_next) {
      if (learner.to_stabilize_hypothesis()) {
        message = { type: "HYP-STAB", val: "The hypothesis is not stable since " + learner.last_ce!.value + ` should ${learner.last_ce!.accepted ? "not" : ""} be accepted` }
      } else {
        message = { type: "SEND-HYP", val: "The automaton is stable and will be sent to the teacher" }
      }
    } else {
      this.state.learner.make_next_query()
      let old_msg = state.memory[state.position].message
      message = { ...old_msg };
      switch (old_msg.type) {
        case "HYP-STAB":
          message.val = "The table has been modified"; break;
        case "SEND-HYP":
          message.val = "The conjecture has been sent to the Teacher"; break;
        case "END":
          return state
        default: throw new Error("You should not be here")
      }
    }
    console.log("Learner automaton", learner.automaton);

    let memory = state.memory;
    memory.push({
      message, dataStructure: <DiscriminationTreeC dt={learner.data_structure.clone()} />,
      automaton: learner.automaton ? <AutomatonC automaton={learner.automaton.clone()} /> : undefined
    })
    let position = state.position + 1
    state = { position, do_next: !state.do_next, memory, learner: state.learner }
    return state
  }
}