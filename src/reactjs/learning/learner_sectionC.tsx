import React from "react";
import { Button, Card } from "react-bootstrap";
import { ArrowClockwise, ArrowCounterclockwise, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import Automaton from "../../lib/automaton/fsm/DFA_NFA";
import LearnerFather from "../../lib/learning/learners/learner_father";
import LearningDataStructure from "../../lib/learning/learners/learning_data_structure";
import { AutomatonC } from "../automaton/automaton";
import Dialog from "../dialog";

export interface PropReact<Learner extends LearnerFather<LearningDataStructure>> { learner: Learner, name: String, change_regex_container: (regex: string) => void }

export type MessageType = "END" | "SEND-HYP" | "CE" | "CONSISTENCY" | "CLOSEDNESS" | "DISC-REF" | "HYP-STAB"

export interface StateReact<Learner extends LearnerFather<LearningDataStructure>> {
  do_next: boolean,
  memory: { dataStructure: LearningDataStructure, automaton: Automaton | undefined, message: { type: MessageType, val: string } }[],
  position: number,
  learner: Learner,
  show_regex_dialog: boolean
}


export abstract class LearnerSection<LearnerT extends LearnerFather<LearningDataStructure>> extends React.Component<PropReact<LearnerT>, StateReact<LearnerT>>{
  constructor(prop: PropReact<LearnerT>) {
    super(prop)
    this.state = {
      do_next: true,
      memory: [{
        message: { type: "CE", val: "Learning with " + prop.name },
        dataStructure: prop.learner.data_structure.clone(),
        automaton: undefined
      }], position: 0, learner: prop.learner,
      show_regex_dialog: false,
    };
  }

  abstract dataStructureToNodeElement(ds: LearningDataStructure): React.ReactElement;
  abstract next_op_child(state: StateReact<LearnerT>): StateReact<LearnerT>;

  next_op(state: StateReact<LearnerT>): StateReact<LearnerT> {
    if (state.position === state.memory.length - 1) {
      state = this.next_op_child(state)
    } else {
      state.position = state.position + 1
    }
    return state
  }

  prev_op(): void {
    if (this.state.position > 0) {
      this.setState({ position: this.state.position - 1 })
    }
  }

  all_steps() {
    let state = { ...this.state }
    if (state.position === state.memory.length) return
    while (!this.state.learner.finish) state = this.next_op(state)
    this.setState({ ...state })
    this.setState({ position: this.state.memory.length - 1 })
  }

  reload() {
    if (this.state.position !== 0)
      this.setState({ position: 0, })
  }

  create_card(title: string, content: React.ReactElement) {
    return <Card className="border-primary text-primary my-2">
      <Card.Header>
        {title}
      </Card.Header>
      <Card.Body>
        {content}
      </Card.Body>
    </Card>
  }

  change_learner(regex: string | undefined) {
    if (regex) {
      let learner = this.create_new_learner(regex)
      let newState = this.create_new_state(regex)
      // this.props.change_teacher(regex)
      this.setState({ ...newState, learner })
      this.props.change_regex_container(regex)
    }
    this.setState({ show_regex_dialog: false })
  }

  create_text(msg: string) {
    return <p className="text-center m-0">{msg}</p>
  }

  abstract create_new_learner(regex: string): LearnerT;

  create_new_state(regex: string): StateReact<LearnerT> {
    let learner = this.create_new_learner(regex)
    return {
      do_next: true,
      memory: [{
        message: { type: "CE", val: "Learning with " + this.props.name },
        dataStructure: learner.data_structure.clone(),
        automaton: undefined
      }], position: 0, learner: learner,
      show_regex_dialog: false,
    }
  }

  render(): React.ReactElement {
    let position = this.state.position
    let memory_cell = this.state.memory[position]

    return <div className="body-container">
      <Dialog show={this.state.show_regex_dialog} fn={this.change_learner.bind(this)} />
      <div className="text-end sticky-top text-end sticky-top d-flex justify-content-between">
        <div className="d-flex">
          <Button className="btn-secondary" onClick={() => {
            this.setState({ show_regex_dialog: true })
          }}>
            Enter Regex
          </Button>
        </div>

        <div className="btn-group" role="group" aria-label="Btn-group8">
          <button type="button" className="btn btn-secondary" onClick={() => this.reload()} >           <ArrowCounterclockwise /></button >
          <button type="button" className="btn btn-secondary" disabled={position === 0} onClick={() => this.prev_op()} ><CaretLeftFill /></button >
          <button type="button" className="btn btn-secondary" disabled={position === this.state.memory.length - 1 && this.state.learner.finish} onClick={() => {
            let n = this.next_op(this.state);
            this.setState(n)
            position = n.position
            memory_cell = n.memory[position]
          }}><CaretRightFill /></button>
          <button type="button" className="btn btn-secondary" onClick={() => this.all_steps()}><ArrowClockwise /></button>
        </div>
      </div>
      {this.create_card("Language to Learn", this.create_text(this.state.learner.teacher.regex))}
      {this.create_card("Message", this.create_text(memory_cell.message.val))}
      {memory_cell.automaton ? this.create_card("Automaton", <AutomatonC automaton={memory_cell.automaton!} />) : <></>}
      {this.create_card("Observation Table", this.dataStructureToNodeElement(memory_cell.dataStructure))}
    </div >
  }
}