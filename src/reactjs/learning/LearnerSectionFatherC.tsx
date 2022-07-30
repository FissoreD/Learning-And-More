import React, { ReactElement } from "react";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import { ArrowClockwise, ArrowCounterclockwise, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import FSM from "../../lib/automaton/FSM_interface";
import Clonable from "../../lib/Clonable.interface";
import LearnerFather from "../../lib/learning/learners/LearnerFather";
import Dialog from "../components/Dialog";
import GraphDotRender from "../components/DotRender";
import { setFromPosition } from "../globalFunctions";

export type MessageType = "END" | "SEND-HYP" | "CE" | "CONSISTENCY" | "CLOSEDNESS" | "DISC-REF" | "HYP-STAB"

export interface PropReact<StateType> {
  learner: LearnerFather<Clonable, StateType>,
  name: String,
  changeRegexContainer: (regex: string) => void, pos: number
}

export interface StateReact<StateType> {
  doNext: boolean,
  memory: { dataStructure: Clonable, automaton: FSM<StateType> | undefined, message: { type: MessageType, val: string } }[],
  position: number,
  learner: LearnerFather<Clonable, StateType>,
  showRegexDialog: boolean
}

type Learner<StateType> = LearnerFather<Clonable, StateType>

export abstract class LearnerSection<StateType> extends React.Component<PropReact<StateType>, StateReact<StateType>>{
  constructor(prop: PropReact<StateType>) {
    super(prop)
    this.state = this.allSteps(
      this.createNewState(prop.learner.teacher.regex), prop.pos
    );
    setFromPosition(prop.pos + "", 2)
  }

  abstract dataStructureToNodeElement(ds: Clonable): React.ReactElement;
  abstract nextOpChild(state: StateReact<StateType>): StateReact<StateType>;

  nextOp(state: StateReact<StateType>): StateReact<StateType> {
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

  allSteps(state: StateReact<StateType>, pos?: number) {
    if (state.position === state.memory.length) return state;
    let i = 0;
    while (pos === undefined || (pos !== undefined && i < pos)) {
      if (state.learner.finish) {
        if (pos) { i--; } else { i = state.memory.length - 1 };
        break;
      };
      state = this.nextOp(state);
      i++
    }
    state.position = i;
    return state;
  }

  reload() {
    if (this.state.position !== 0) this.setState({ position: 0, });
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

  createText(msg: string) {
    return <p className="text-center m-0">{msg}</p>
  }

  abstract createNewLearner(regex: string): Learner<StateType>;

  createNewState(regex: string): StateReact<StateType> {
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

  createNextSetpButtonGroup() {
    let isFirst = this.state.position === 0,
      isLast = this.state.memory.length - 1 === this.state.position && this.state.learner.finish,
      buttons: ({ img: ReactElement, action: (() => void), disabled: boolean })[] = [
        { img: <ArrowCounterclockwise />, action: this.reload.bind(this), disabled: isFirst },
        { img: <CaretLeftFill />, action: this.prevOp.bind(this), disabled: isFirst },
        { img: <CaretRightFill />, action: () => this.setState(this.nextOp(this.state)), disabled: isLast },
        { img: <ArrowClockwise />, action: () => this.setState(this.allSteps({ ...this.state })), disabled: isLast }
      ]
    return <ButtonGroup>
      {buttons.map(({ img, action, disabled }, pos) => <Button key={pos} variant="secondary" disabled={disabled} onClick={action}>{img}</Button>)}
    </ButtonGroup>
  }

  render(): React.ReactElement {
    let position = this.state.position
    let memoryCell = this.state.memory[position]
    setFromPosition(position + "", 2)

    return <div className="body-container">
      {/* To change regex panel */}
      <Dialog show={this.state.showRegexDialog} fn={this.changeLearner.bind(this)} />
      {/* Buttons sticky on top to change regex and change algo step */}
      <div className="text-end sticky-top d-flex justify-content-between">
        <Button className="btn-secondary" onClick={() => {
          this.setState({ showRegexDialog: true })
        }}> Enter Regex </Button>
        {this.createNextSetpButtonGroup()}
      </div>
      {/* Algorithms sections */}
      {this.createCard("Language to Learn", this.createText(this.state.learner.teacher.regex))}
      {this.createCard("Message", this.createText(memoryCell.message.val))}
      {memoryCell.automaton ? this.createCard("Automaton", <GraphDotRender dot={memoryCell.automaton!} />) : <></>}
      {this.createCard("Observation Table", this.dataStructureToNodeElement(memoryCell.dataStructure))}
    </div >
  }
}