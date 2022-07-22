import React from "react";
import { Button, Card } from "react-bootstrap";
import { ArrowClockwise, ArrowCounterclockwise, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import DFA_NFA from "../../lib/automaton/regular/DFA_NFA";
import LearnerFather from "../../lib/learning/learners/learner_father";
import LearningDataStructure from "../../lib/learning/learners/learning_data_structure";
import AutomatonC from "../automaton/automaton";
import Dialog from "../dialog";

export interface PropReact<Learner extends LearnerFather<LearningDataStructure>> { learner: Learner, name: String, changeRegexContainer: (regex: string) => void }

export type MessageType = "END" | "SEND-HYP" | "CE" | "CONSISTENCY" | "CLOSEDNESS" | "DISC-REF" | "HYP-STAB"

export interface StateReact<Learner extends LearnerFather<LearningDataStructure>> {
  doNext: boolean,
  memory: { dataStructure: LearningDataStructure, automaton: DFA_NFA | undefined, message: { type: MessageType, val: string } }[],
  position: number,
  learner: Learner,
  showRegexDialog: boolean
}


export abstract class LearnerSection<LearnerT extends LearnerFather<LearningDataStructure>> extends React.Component<PropReact<LearnerT>, StateReact<LearnerT>>{
  constructor(prop: PropReact<LearnerT>) {
    super(prop)
    this.state = {
      doNext: true,
      memory: [{
        message: { type: "CE", val: "Learning with " + prop.name },
        dataStructure: prop.learner.dataStructure.clone(),
        automaton: undefined
      }], position: 0, learner: prop.learner,
      showRegexDialog: false,
    };
  }

  abstract dataStructureToNodeElement(ds: LearningDataStructure): React.ReactElement;
  abstract nextOpChild(state: StateReact<LearnerT>): StateReact<LearnerT>;

  nextOp(state: StateReact<LearnerT>): StateReact<LearnerT> {
    if (state.position === state.memory.length - 1) {
      state = this.nextOpChild(state)
    } else {
      state.position = state.position + 1
    }
    return state
  }

  prevOp(): void {
    if (this.state.position > 0) {
      this.setState({ position: this.state.position - 1 })
    }
  }

  allSteps() {
    let state = { ...this.state }
    if (state.position === state.memory.length) return
    while (!this.state.learner.finish) state = this.nextOp(state)
    this.setState({ ...state })
    this.setState({ position: this.state.memory.length - 1 })
  }

  reload() {
    if (this.state.position !== 0)
      this.setState({ position: 0, })
  }

  createCard(title: string, content: React.ReactElement) {
    return <Card className="border-primary text-primary my-2">
      <Card.Header>
        {title}
      </Card.Header>
      <Card.Body>
        {content}
      </Card.Body>
    </Card>
  }

  changeLearner(regex: string | undefined) {
    if (regex) {
      let learner = this.createNewLearner(regex)
      let newState = this.createNewState(regex)
      this.setState({ ...newState, learner })
      this.props.changeRegexContainer(regex)
    }
    this.setState({ showRegexDialog: false })
  }

  createText(msg: string) {
    return <p className="text-center m-0">{msg}</p>
  }

  abstract createNewLearner(regex: string): LearnerT;

  createNewState(regex: string): StateReact<LearnerT> {
    let learner = this.createNewLearner(regex)
    return {
      doNext: true,
      memory: [{
        message: { type: "CE", val: "Learning with " + this.props.name },
        dataStructure: learner.dataStructure.clone(),
        automaton: undefined
      }], position: 0, learner: learner,
      showRegexDialog: false,
    }
  }

  render(): React.ReactElement {
    let position = this.state.position
    let memoryCell = this.state.memory[position]

    return <div className="body-container">
      <Dialog show={this.state.showRegexDialog} fn={this.changeLearner.bind(this)} />
      <div className="text-end sticky-top text-end sticky-top d-flex justify-content-between">
        <div className="d-flex">
          <Button className="btn-secondary" onClick={() => {
            this.setState({ showRegexDialog: true })
          }}>
            Enter Regex
          </Button>
        </div>

        <div className="btn-group" role="group" aria-label="Btn-group8">
          <button type="button" className="btn btn-secondary" onClick={() => this.reload()} >           <ArrowCounterclockwise /></button >
          <button type="button" className="btn btn-secondary" disabled={position === 0} onClick={() => this.prevOp()} ><CaretLeftFill /></button >
          <button type="button" className="btn btn-secondary" disabled={position === this.state.memory.length - 1 && this.state.learner.finish} onClick={() => {
            let n = this.nextOp(this.state);
            this.setState(n)
            position = n.position
            memoryCell = n.memory[position]
          }}><CaretRightFill /></button>
          <button type="button" className="btn btn-secondary" onClick={() => this.allSteps()}><ArrowClockwise /></button>
        </div>
      </div>
      {this.createCard("Language to Learn", this.createText(this.state.learner.teacher.regex))}
      {this.createCard("Message", this.createText(memoryCell.message.val))}
      {memoryCell.automaton ? this.createCard("Automaton", <AutomatonC automaton={memoryCell.automaton!} />) : <></>}
      {this.createCard("Observation Table", this.dataStructureToNodeElement(memoryCell.dataStructure))}
    </div >
  }
}