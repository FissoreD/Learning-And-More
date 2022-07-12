import { Component, ReactElement, ReactNode } from "react";
import { Container, Dropdown } from "react-bootstrap";
import aut from "../../json/automata.json";
import LearnerFather from "../../lib/learning/learners/learner_father";
import LearningDataStructure from "../../lib/learning/learners/learning_data_structure";

export interface PropReact<Learner extends LearnerFather<LearningDataStructure>> { learner: Learner, name: String }

export type MessageType = "END" | "SEND-HYP" | "CE" | "CONSISTENCY" | "CLOSEDNESS" | "DISC-REF" | "HYP-STAB"

export interface StateReact<Learner extends LearnerFather<LearningDataStructure>> {
  do_next: boolean,
  memory: { dataStructure: ReactElement, automaton: ReactElement | undefined, message: { type: MessageType, val: string } }[],
  position: number,
  learner: Learner
}


export abstract class LearnerSection<LearnerT extends LearnerFather<LearningDataStructure>> extends Component<PropReact<LearnerT>, StateReact<LearnerT>>{
  constructor(prop: PropReact<LearnerT>) {
    super(prop)
    this.state = {
      do_next: true,
      memory: [{
        message: { type: "CE", val: "Learning with " + prop.name },
        dataStructure: this.dataStructureToNodeElement(prop.learner),
        automaton: undefined
      }], position: 0, learner: prop.learner
    };
    console.log(this.state.learner);

  }

  abstract dataStructureToNodeElement(learner: LearnerT): ReactElement;
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
    while (!this.state.learner.finish) state = this.next_op(state)
    this.setState({ ...state })
    this.setState({ position: this.state.memory.length - 1 })
  }

  reload() {
    this.setState({ position: 0 })
  }

  create_card(title: string, content: ReactElement) {
    return <div className="card">
      <div className="card-header">
        {title}
      </div>
      <div className="card-body">
        {content}
      </div>
    </div>
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
        dataStructure: this.dataStructureToNodeElement(learner),
        automaton: undefined
      }], position: 0, learner: learner
    }
  }

  render(): ReactNode {
    let position = this.state.position
    let memory_cell = this.state.memory[position]
    return <Container className="body-container">
      <div className="text-end sticky-top text-end sticky-top d-flex justify-content-between">
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Choose your Regexp
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => this.setState(this.create_new_state(aut.a_or_bb))}>a+bb</Dropdown.Item>
            <Dropdown.Item onClick={() => this.setState(this.create_new_state(aut["(a+b)*a(a+b)^4"]))}>(a+b)*a(a+b)^4</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <div className="btn-group" role="group" aria-label="Btn-group8">
          <button type="button" className="btn btn-secondary" onClick={() => this.reload()} >Reload</button >
          <button type="button" className="btn btn-secondary" disabled={position === 0} onClick={() => this.prev_op()} >Previous</button >
          <button type="button" className="btn btn-secondary" disabled={position === this.state.memory.length - 1 && this.state.learner.finish} onClick={() => this.setState(this.next_op(this.state))}>Next</button>
          <button type="button" className="btn btn-secondary" onClick={() => this.all_steps()}>Run all algo</button>
        </div>
      </div>
      {this.create_card("Language to Learn", this.create_text(this.props.name + " TODO"))}
      {this.create_card("Message", this.create_text(memory_cell.message.val))}
      {memory_cell.automaton ? this.create_card("Automaton", memory_cell.automaton!) : <></>}
      {this.create_card("Observation Table", memory_cell.dataStructure)}
    </Container>
  }
}