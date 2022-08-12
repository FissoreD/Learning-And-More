import React, { ReactElement } from "react";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import { ArrowClockwise, ArrowCounterclockwise, CaretLeftFill, CaretRightFill } from "react-bootstrap-icons";
import FSM from "../../../lib/automaton/FSM.interface";
import DataStructure from "../../../lib/learning/learners/DataStructure.interface";
import LearnerFather from "../../../lib/learning/learners/LearnerFather";
import Dialog from "../../components/Dialog";
import GraphDotRender from "../../components/DotRender";
import VPASwitcher from "../../components/VPASwitcher";
import { logRender } from "../../globalFunctions";
import { setLearnerPos, setLearnerRegex } from "../../redux/actions/learnerAction";
import { StoreInterface } from "../../redux/storeTypes";
import { LearnerType } from "./LearnerPage";

export type MessageType = "END" | "SEND-HYP" | "CE" |
  "CONSISTENCY" | "CLOSEDNESS" | "DISC-REF" | "HYP-STAB"

export interface PropReactLearnerViewer {
  learner: LearnerFather,
  name: LearnerType,
  pos: number, regex: string,
  updatePosition: (l: LearnerType, pos: number) => void,
  updateLearnerAlgo: (l: LearnerType, algo: string) => void
}

export interface StateReact {
  doNext: boolean,
  memory: { dataStructure: DataStructure, automaton: FSM | undefined, message: { type: MessageType, val: JSX.Element } }[],
  position: number,
  learner: LearnerFather
}

export default abstract class LearnerViewer extends React.Component<PropReactLearnerViewer, StateReact>{

  constructor(prop: PropReactLearnerViewer) {
    super(prop)
    let state = this.allSteps(this.createNewState(prop.learner.teacher.automaton), prop.pos);
    this.props.updatePosition(this.props.name, state.position)
    this.state = state;
  }

  shouldComponentUpdate(nextProps: Readonly<PropReactLearnerViewer>) {
    return nextProps.pos !== this.props.pos || this.props.regex !== nextProps.regex;
  }

  abstract dataStructureToNodeElement(ds: DataStructure): React.ReactElement;
  abstract nextOpChild(state: StateReact): StateReact;

  nextOp(state: StateReact): StateReact {
    if (state.position === state.memory.length - 1) {
      state = this.nextOpChild(state);
    } else {
      state.position = state.position + 1;
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
      try {
        this.setState({ learner: this.createNewLearner(regex) })
        this.props.updateLearnerAlgo(this.props.name, regex);
      } catch {
        alert(`Invalid regex : ${regex}`)
      }
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
    logRender(`LearnerViewer ${this.props.name}`)

    let position = this.state.position
    let memoryCell = this.state.memory[position]

    return <div className="body-container">
      {/* Buttons sticky on top to change regex and change algo step */}
      <div className="text-end sticky-top d-flex justify-content-between">
        <VPASwitcherButton isVpa={this.props.name === "TTT-VPA"} changeRegex={this.changeRegex.bind(this)} />
        {this.createNextSetpButtonGroup()}
      </div>
      {/* Algorithms sections */}
      {this.createCard("Language to Learn", this.createText(this.state.learner.teacher.automaton.grammar))}
      {this.createCard("Message", memoryCell.message.val)}
      {memoryCell.automaton ? this.createCard("Automaton", <GraphDotRender dot={memoryCell.automaton!} />) : <></>}
      {this.createCard("Observation Table", this.dataStructureToNodeElement(memoryCell.dataStructure))}
    </div >
  }
}

interface VPASwitcherButtonProp {
  isVpa: boolean,
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
    let { changeRegex, isVpa } = this.props
    let params = { show: this.state.show, fn: (l?: string) => this.hideDialogWrapper(changeRegex, l) }
    return <>
      {isVpa ? <VPASwitcher {...params} /> : <Dialog {...params} />}
      <Button className="btn-secondary" onClick={() => {
        this.setState({ show: true })
      }}> Change Teacher </Button>
    </>
  }
}

export function mapStateToPropsLearner(learnerMethod: (value: string) => LearnerFather, name: LearnerType) {
  return (state: StoreInterface) => {
    return {
      pos: state.learner.pos[name],
      learner: learnerMethod(state.learner.algos[name]),
      name: name, regex: state.learner.algos[name]
    }
  }
}

export function mapDispatchToPropsLearner(dispatch: Function) {
  return {
    updatePosition: (l: LearnerType, pos: number) => dispatch(setLearnerPos(l, pos)),
    updateLearnerAlgo: (l: LearnerType, regex: string) => dispatch(setLearnerRegex(l, regex)),
  }
}
