import { ReactElement } from "react";
import DataStructure from "../../../../lib/learning/learners/DataStructure.interface";
import LearnerObsTableFather from "../../../../lib/learning/learners/observation_table/LearnerObsTableFather";
import ObservationTable from "../../../../lib/learning/learners/observation_table/ObservationTable";
import LearnerViewer, { MessageType, PropReactLearnerViewer, StateReact } from "../LearnerViewer";
import ObservationTableViewer from "./ObservationTableViewer";

export default abstract class LearnerObsTableFatherViewer extends LearnerViewer {
  tableToModifyAfterCe: string;

  constructor(prop: PropReactLearnerViewer, tableToModif: string) {
    super(prop)
    this.tableToModifyAfterCe = tableToModif
  }

  dataStructureToNodeElement(ds: DataStructure, primeLines?: string[]): ReactElement {
    return <ObservationTableViewer dataStructure={ds.clone() as ObservationTable} primeLines={primeLines} />
  }

  abstract closeMessage(closeRep: string): JSX.Element;
  abstract consistentMessage(s1: string, s2: string, newCol: string): JSX.Element;

  nextOpChild(state: StateReact): StateReact {
    let learner = state.learner as LearnerObsTableFather;
    if (learner.finish) return state
    var message: { type: MessageType, val: JSX.Element };
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
          type: "CE", val: <span>Received the counter-example <i>{prop}</i></span>
        }
      } else if (learner.finish || learner.automaton !== undefined) {
        message = {
          type: "END", val: <span>The teacher has accepted the last conjecture</span>
        }
      } else {
        message = {
          type: "SEND-HYP", val: <span>The table is <i>closed</i> and <i>consistent</i></span>
        }
      }
    } else {
      state.learner.makeNextQuery()

      let oldMsg = state.memory[state.position].message
      message = { ...oldMsg };
      switch (oldMsg.type) {
        case "CONSISTENCY":
        case "CLOSEDNESS":
          message.val = <span> The table has been modified</span>; break;
        case "CE":
          message.val = <span> The counter-example has been added in <i>{this.props.name === "L*" ? "S" : "E"}</i></span>; break;
        case "SEND-HYP":
          message.val = <span>The conjecture has been sent to the Teacher</span>; break;
        case "END":
          return state
        default: throw new Error("You should not be here")
      }
    }
    let memory = state.memory;
    memory.push({
      message, dataStructure: learner.getDataStructure().clone(),
      automaton: learner.automaton ? learner.automaton.clone() : undefined
    })
    let position = state.position + 1
    state = { position, doNext: !state.doNext, memory, learner: state.learner }
    return state
  }
}