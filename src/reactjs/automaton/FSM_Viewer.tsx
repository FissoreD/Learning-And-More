import React from "react";
import { Accordion, Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import { BootstrapReboot } from "react-bootstrap-icons";
import AlphabetVPA from "../../lib/automaton/context_free/AlphabetVPA";
import StateVPA from "../../lib/automaton/context_free/StateVPA";
import VPA from "../../lib/automaton/context_free/VPA";
import FSM from "../../lib/automaton/FSM_interface";
import DFA_NFA from "../../lib/automaton/regular/DFA_NFA";
import StateDFA from "../../lib/automaton/regular/StateDFA";
import Dialog from "../components/Dialog";
import GraphDotRender from "../components/GraphDotRender";
import { setFromPosition } from "../globalFunctions";
import { FLEX_CENTER } from "../globalVars";

let createVPA1 = (): VPA => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B", "C"], INT: ["I"] })
  let stack_alphabet = ["0"]
  let state1 = new StateVPA({ name: "1", isAccepting: true, alphabet, stackAlphabet: stack_alphabet })
  let state2 = new StateVPA({ name: "2", isInitial: true, alphabet, stackAlphabet: stack_alphabet })
  state1.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state1.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state1.addTransition({ symbol: "C", topStack: "0", successor: state1 })
  state2.addTransition({ symbol: "A", topStack: "0", successor: state2 })
  let vpa = new VPA([state1, state2])
  return vpa
}

let createVPA2 = (): VPA => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B", "C"], INT: ["I"] })
  let stack_alphabet = ["2"]
  let state1 = new StateVPA({ name: "1", isAccepting: true, isInitial: true, alphabet, stackAlphabet: stack_alphabet })
  state1.addTransition({ symbol: "I", successor: state1 })
  state1.addTransition({ symbol: "A", topStack: "2", successor: state1 })
  state1.addTransition({ symbol: "B", topStack: "2", successor: state1 })
  let vpa = new VPA([state1])
  return vpa
}

type Operation = "∪" | "∩" | "△" | "/" | "Det" | "~"
const binaryOp: Operation[] = ["∪", "∩", "△", "/"]
const unaryOp: Operation[] = ["Det", "~"]

type Algos = 'VPA' | 'DFA'
let algosList: Algos[] = ['DFA', 'VPA']

interface ReactState {
  currentAlgo: Algos,
  a1: FSM<StateDFA | StateVPA>,
  a2: FSM<StateDFA | StateVPA>,
  opeartionList: {
    a1: FSM<StateDFA | StateVPA>,
    operation: Operation,
    is_a1: boolean,
    a2: FSM<StateDFA | StateVPA>,
    res: FSM<StateDFA | StateVPA>
  }[],
  showRegexSetter: boolean,
  changeRegexA1: boolean
}

interface ReactProp {
  cnt: string
}


export default class FSM_Viewer extends React.Component<ReactProp, ReactState>{

  constructor(props: ReactProp) {
    super(props)
    this.state = this.changeCnt(props.cnt)
  }

  changeCnt(fsmType: string): ReactState {
    let a1, a2;
    switch (fsmType) {
      case "VPA": { a1 = createVPA1(); a2 = createVPA2(); break; }
      default: {
        a1 = DFA_NFA.regexToAutomaton("(ac+b)*(b+c)")
        a2 = DFA_NFA.regexToAutomaton("(a+b)*c")
        fsmType = "DFA"
        break;
      }
    }
    setFromPosition(fsmType, 1)
    return {
      currentAlgo: fsmType as Algos, a1, a2,
      opeartionList: [{ a1, a2, operation: "∪", res: (a1 as VPA).union(a2 as VPA), is_a1: true, }],
      showRegexSetter: false,
      changeRegexA1: true
    }
  }

  setRegex(regex: string | undefined) {
    if (regex) {
      if (this.state.a1 instanceof DFA_NFA) {
        let aut = DFA_NFA.regexToAutomaton(regex);
        this.setState((state) => {
          if (state.changeRegexA1) {
            return { a1: aut!, a2: state.a2 }
          } else {
            return { a1: state.a1, a2: aut! }
          }
        });
        let old_op = this.state.opeartionList[0]
        this.addNewAut(old_op.operation, old_op.is_a1)
      } else {
        alert("Not implemented")
      }
    }
    this.setState({ showRegexSetter: false })
  }

  createCardAutomaton(r: FSM<StateDFA | StateVPA>, pos: number) {
    return <Card className="h-100 border-primary text-primary">
      <Card.Header>
        Automaton A{pos}
        {<a className="float-end" onClick={() => {
          this.setState({ showRegexSetter: true, changeRegexA1: pos === 1 });
        }}><BootstrapReboot /></a>}
      </Card.Header>
      <div className="h-100 d-flex justify-content-center align-items-center" style={{ minHeight: "130px" }}>
        <GraphDotRender dot={r} />
      </div>
      <Card.Body className="py-1">
        <Card.Title className="my-0 text-nowrap text-center" style={{ overflowY: "hidden" }}>A{pos}</Card.Title>
      </Card.Body>
      <hr className="my-0" />
      <Card.Body className="py-1 text-center">
        <ButtonGroup>
          <Button onClick={() => this.addNewAut("~", pos === 1)}>Complement(A{pos})</Button>
        </ButtonGroup>
      </Card.Body>
    </Card>
  }

  addNewAut(operation: Operation, is_a1 = true) {
    this.setState((state) => {
      let { a1: r1, a2: r2 } = state
      let [a1, a2] = [r1, r2].map(e => e)
      let res: VPA;
      switch (operation) {
        case "/": res = a1.difference(a2) as VPA; break;
        case "∩": res = a1.intersection(a2) as VPA; break;
        case "∪": res = a1.union(a2) as VPA; break;
        case "△": res = a1.symmetricDifference(a2) as VPA; break;
        case "~": res = (is_a1 ? a1 : a2).complement() as VPA; break;
        case "Det": res = a1.determinize() as VPA; break;
        default: throw new Error("Should not be here")
      }
      let opeartionList = state.opeartionList
      opeartionList = [{ a1, a2, operation, res, is_a1 }]
      return { opeartionList }
    })
  }

  operationToString(op: Operation) {
    switch (op) {
      case "∪": return "Union"
      case "∩": return "Intersection"
      case "/": return "Difference"
      case "△": return "Symmetric Difference"
      case "~": return "Complement"
      case "Det": return "Determinization"
    }
  }

  switchAutomata() {
    let { a1: r1, a2: r2, opeartionList } = this.state
    this.setState(() => { return { a1: r2, a2: r1 } })
    if ((["/", "~"] as Operation[]).includes(opeartionList[0].operation))
      this.addNewAut(opeartionList[0].operation, opeartionList[0].is_a1)
  }

  createOpHeader(op: Operation, is_a1: boolean) {
    let isUnary = unaryOp.includes(op)
    return this.operationToString(op) + (isUnary ? `(A${is_a1 ? 1 : 2})` : "(A1, A2)")
  }

  render(): React.ReactNode {
    let createButtons = () => {
      return (
        <ButtonGroup className="d-flex">{algosList.map(
          (algo, pos) =>
            <React.Fragment key={pos}>
              <input type="radio" className="btn-check" name="btnradio" id={"btnradio" + pos} autoComplete="off" defaultChecked={algo === this.state.currentAlgo} />
              <label className="btn btn-outline-primary" htmlFor={"btnradio" + pos} onClick={
                () => this.setState(this.changeCnt(algo))
              }>{algo}</label>
            </React.Fragment>)}
        </ButtonGroup>)
    }
    return <>
      <div className={"my-2 " + FLEX_CENTER}>{createButtons()}</div>
      <Dialog fn={this.setRegex.bind(this)} show={this.state.showRegexSetter} />
      <Row>
        <Col className="mb-3 mb-sm-0" sm={5}>{this.createCardAutomaton(this.state.a1, 1)}</Col>
        <Col className="d-flex text-center align-self-center justify-content-center">
          <ButtonGroup vertical className="secondary d-none d-sm-inline-flex">
            {binaryOp.map(e => <Button key={e} onClick={() => this.addNewAut(e)}>{e}</Button>)}
            <Button onClick={() => this.switchAutomata()}>⇌</Button>
          </ButtonGroup>
          <ButtonGroup className="secondary d-sm-none">
            {binaryOp.map(e => <Button key={e} onClick={() => this.addNewAut(e)}>{e}</Button>)}
            <Button onClick={() => this.switchAutomata()}>⇌</Button>
          </ButtonGroup>
        </Col>
        <Col className="mt-3 mt-sm-0" sm={5}>{this.createCardAutomaton(this.state.a2, 2)}</Col>
      </Row>
      <Accordion defaultActiveKey={['0']} alwaysOpen className="mt-3">

        {this.state.opeartionList.map((e, pos) =>
          <Accordion.Item eventKey={pos + ""} key={pos} >
            <Accordion.Header>{this.createOpHeader(e.operation, e.is_a1)} - Normal</Accordion.Header>
            <Accordion.Body className="justify-content-center">
              <Col xs={12} className="align-self-center" ><GraphDotRender dot={e.res} /></Col>
            </Accordion.Body>
          </Accordion.Item>)}

        {this.state.opeartionList.map((e, pos) =>
          <Accordion.Item eventKey={(1 + pos) + ""} key={pos} >
            <Accordion.Header>{this.createOpHeader(e.operation, e.is_a1)} - Minimized</Accordion.Header>
            <Accordion.Body className="justify-content-center">
              <Col xs={12} className="align-self-center" ><GraphDotRender dot={e.res.minimize()} /></Col>
            </Accordion.Body>
          </Accordion.Item>)}

      </Accordion>
    </>
  }
}
