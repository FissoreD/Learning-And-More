import React, { ReactElement } from "react";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import { ArrowClockwise, ArrowCounterclockwise, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import VPA from "../../../lib/automaton/context_free/VPA";
import FSM from "../../../lib/automaton/FSM.interface";
import DataStructure from "../../../lib/learning/learners/DataStructure.interface";
import LearnerFather from "../../../lib/learning/learners/LearnerFather";
import Dialog from "../../components/Dialog";
import GraphDotRender from "../../components/DotRender";
import VPASwitcher from "../../components/VPASwitcher";
import { logRender } from "../../globalFunctions";
import { LearnerType } from "./LearnerPage";

export type MessageType = "END" | "SEND-HYP" | "CE" | "CONSISTENCY" | "CLOSEDNESS" | "DISC-REF" | "HYP-STAB"

export interface PropReact {
  learner: LearnerFather,
  name: LearnerType, pos: number,
  updatePosition: (l: LearnerType, pos: number) => void
}

export interface StateReact {
  doNext: boolean,
  memory: { dataStructure: DataStructure, automaton: FSM | undefined, message: { type: MessageType, val: JSX.Element } }[],
  position: number,
  learner: LearnerFather,
  firstTime: boolean
}

export abstract class LearnerViewer extends React.Component<PropReact, StateReact>{
  constructor(prop: PropReact) {
    super(prop)
    this.state = {
      ...this.allSteps(
        this.createNewState(prop.learner.teacher.automaton), prop.pos
      ), firstTime: true
    };
  }

  abstract dataStructureToNodeElement(ds: DataStructure): React.ReactElement;
  abstract nextOpChild(state: StateReact): StateReact;

  nextOp(state: StateReact): StateReact {
    if (state.position === state.memory.length - 1) {
      state = this.nextOpChild(state)
    } else {
      state.position = state.position + 1
    }
    return state
  }

  prevOp(): void {
    if (this.state.position > 0) {
      this.props.updatePosition(this.props.name, this.state.position - 1)
      this.setState({ position: this.state.position - 1 })
    }
  }

  allSteps(state: StateReact, pos?: number) {
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
    this.props.updatePosition(this.props.name, 0)
  }

  changeRegex(regex: string | undefined) {
    if (regex) {
      let learner = this.createNewLearner(regex)
      let newState = this.createNewState(learner.teacher.automaton)
      this.setState({ ...newState, learner })
    }
  }

  changeLearner(fsm: FSM | undefined) {
    if (fsm) {
      let learner = this.createNewLearner(fsm)
      let newState = this.createNewState(fsm)
      this.setState({ ...newState, learner })
    }
  }

  createCard(title: string, content: React.ReactElement) {
    return <Card className="border-primary text-primary my-2">
      <Card.Header>
        {title}
      </Card.Header>
      <Card.Body className="text-center">
        {content}
      </Card.Body>
    </Card>
  }

  createText(msg: string) {
    return <p className="text-center m-0">{msg}</p>
  }

  abstract createNewLearner(fsm: FSM | string): LearnerFather;

  createNewState(fsm: FSM): StateReact {
    let learner = this.createNewLearner(fsm)
    return {
      doNext: true,
      memory: [{
        message: { type: "CE", val: <span>Learning with {this.props.name}</span> },
        dataStructure: learner.getDataStructure().clone(),
        automaton: undefined
      }], position: 0, learner: learner,
      firstTime: false
    }
  }

  createNextSetpButtonGroup() {
    let isFirst = this.state.position === 0,
      isLast = this.state.memory.length - 1 === this.state.position && this.state.learner.finish,
      buttons: ({ img: ReactElement, action: (() => void), disabled: boolean })[] = [
        { img: <ArrowCounterclockwise />, action: this.reload.bind(this), disabled: isFirst },
        { img: <CaretLeftFill />, action: this.prevOp.bind(this), disabled: isFirst },
        {
          img: <CaretRightFill />, action: (() => {
            this.props.updatePosition(this.props.name, this.state.position + 1);
            this.setState(this.nextOp(this.state))
          }), disabled: isLast
        },
        {
          img: <ArrowClockwise />, action: () => {
            this.setState(() => {
              let state = this.allSteps({ ...this.state })
              this.props.updatePosition(this.props.name, state.position);
              return state
            })
          },
          disabled: isLast
        }
      ]
    return <ButtonGroup>
      {buttons.map(({ img, action, disabled }, pos) => <Button key={pos} variant="secondary" disabled={disabled} onClick={action}>{img}</Button>)}
    </ButtonGroup>
  }

  render(): React.ReactElement {
    logRender("LearnerFather")
    let position = this.state.position
    let memoryCell = this.state.memory[position]
    return <div className="body-container">
      {/* Buttons sticky on top to change regex and change algo step */}
      <div className="text-end sticky-top d-flex justify-content-between">
        <VPASwitcherButton isVpa={this.props.name === "TTT-VPA"} changeLearner={this.changeLearner.bind(this)} changeRegex={this.changeRegex.bind(this)} />
        {this.createNextSetpButtonGroup()}
      </div>
      {/* Algorithms sections */}
      {this.createCard("Language to Learn", this.createText(this.state.learner.teacher.regex))}
      {this.createCard("Message", memoryCell.message.val)}
      {memoryCell.automaton ? this.createCard("Automaton", <GraphDotRender dot={memoryCell.automaton!} />) : <></>}
      {this.createCard("Observation Table", this.dataStructureToNodeElement(memoryCell.dataStructure))}
    </div >
  }
}

interface VPASwitcherButtonProp {
  isVpa: boolean,
  changeLearner: (l?: VPA) => void,
  changeRegex: (s?: string) => void
}

class VPASwitcherButton extends React.Component<VPASwitcherButtonProp, { show: boolean }>{
  constructor(prop: VPASwitcherButtonProp) {
    super(prop)
    this.state = { show: false }
  }

  hideDialogWrapper<T>(f: (args: T) => void, args: T) {
    this.setState({ show: false });
    f(args);
  }

  render(): React.ReactNode {
    logRender("VPASwitcherButton")
    let { changeLearner, changeRegex, isVpa } = this.props

    return <>
      {/* To change regex panel */}
      {isVpa ?
        <VPASwitcher show={this.state.show} fn={(l?: VPA) => this.hideDialogWrapper(changeLearner, l)} /> :
        <Dialog show={this.state.show} fn={(s?: string) => this.hideDialogWrapper(changeRegex, s)} />
      }
      <Button className="btn-secondary" onClick={() => {
        this.setState({ show: true })
      }}> Change Teacher </Button>
    </>
  }
}