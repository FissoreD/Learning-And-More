import { ReactElement } from "react";
import LearningDataStructure from "../../../lib/learning/learners/learning_data_structure";
import LearnerOTBase from "../../../lib/learning/learners/observation_table/learner_ot_base";
import ObservationTable from "../../../lib/learning/learners/observation_table/observation_table";
import { LearnerSection, MessageType, PropReact, StateReact } from "../learner_sectionC";
import { ObservationTableC } from "./observation_table_c";

export default abstract class LearnerOTBaseC extends LearnerSection<LearnerOTBase>{
  tableToModifyAfterCe: string;

  constructor(prop: PropReact<LearnerOTBase>, tableToModif: string) {
    super(prop)
    this.tableToModifyAfterCe = tableToModif

  }
  dataStructureToNodeElement(ds: LearningDataStructure): ReactElement {
    return <ObservationTableC dataStructure={ds.clone() as ObservationTable} />
  }

  abstract closeMessage(closeRep: string): string;
  abstract consistentMessage(s1: string, s2: string, newCol: string): string;

  nextOpChild(state: StateReact<LearnerOTBase>): StateReact<LearnerOTBase> {
    let learner = this.state.learner;
    if (learner.finish) return state
    var message: { type: MessageType, val: string };
    if (state.doNext) {
      let prop;
      if ((prop = learner.isClose())) {
        message = { type: "CLOSEDNESS", val: this.closeMessage(prop) }
      } else if ((prop = learner.isConsistent())) {
        message = {
          type: "CONSISTENCY", val: this.consistentMessage(prop[0], prop[1], prop[2])
        }
      } else if ((prop = learner.counterExample)) {
        message = {
          type: "CE", val: "Received the counter-example " + prop
        }
      } else if (learner.finish || learner.automaton !== undefined) {
        message = {
          type: "END", val: "The teacher has accepted the last conjecture"
        }
      } else {
        message = {
          type: "SEND-HYP", val: "The table is closed and consistent"
        }
      }
    } else {
      this.state.learner.makeNextQuery()

      let oldMsg = state.memory[state.position].message
      message = { ...oldMsg };
      switch (oldMsg.type) {
        case "CONSISTENCY":
        case "CLOSEDNESS":
          message.val = "The table has been modified"; break;
        case "CE":
          message.val = "The counter-example has been added in " + this.tableToModifyAfterCe; break;
        case "SEND-HYP":
          message.val = "The conjecture has been sent to the Teacher"; break;
        case "END":
          return state
        default: throw new Error("You should not be here")
      }
    }
    let memory = state.memory;
    memory.push({
      message, dataStructure: learner.dataStructure.clone(),
      automaton: learner.automaton ? learner.automaton.clone() : undefined
    })
    let position = state.position + 1
    state = { position, doNext: !state.doNext, memory, learner: state.learner, showRegexDialog: false }
    return state
  }
}