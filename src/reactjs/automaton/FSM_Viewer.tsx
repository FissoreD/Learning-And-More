import React from "react";
import { Accordion, Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import { BootstrapReboot } from "react-bootstrap-icons";
import StateVPA from "../../lib/automaton/context_free/StateVPA";
import VPA from "../../lib/automaton/context_free/VPA";
import FSM from "../../lib/automaton/FSM_interface";
import DFA_NFA from "../../lib/automaton/regular/DFA_NFA";
import StateDFA from "../../lib/automaton/regular/StateDFA";
import { createVPA2, createVPA4 } from "../../lib/__test__/VPAforTest";
import Dialog from "../components/Dialog";
import GraphDotRender from "../components/DotRender";
import { FLEX_CENTER } from "../globalVars";

type Operation = "∪" | "∩" | "△" | "/" | "Det" | "~"
const binaryOp: Operation[] = ["∪", "∩", "△", "/"]
const unaryOp: Operation[] = ["Det", "~"]

type FSM_Type = 'VPA' | 'DFA'

interface ReactState {
  fsmType: FSM_Type,
  a1: FSM<StateDFA | StateVPA>,
  a2: FSM<StateDFA | StateVPA>,
  lastOperation: {
    a1: FSM<StateDFA | StateVPA>,
    operation: Operation,
    is_a1: boolean,
    a2: FSM<StateDFA | StateVPA>,
    res: FSM<StateDFA | StateVPA>
  },
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
      case "VPA": { a1 = createVPA4(); a2 = createVPA2(); break; }
      default: {
        a1 = DFA_NFA.regexToAutomaton("(ac+b)*(b+c)")
        a2 = DFA_NFA.regexToAutomaton("(a+b)*c")
        fsmType = "DFA"
        break;
      }
    }
    return {
      fsmType: fsmType as FSM_Type, a1, a2,
      lastOperation: { a1, a2, operation: "∪", res: (a1 as VPA).union(a2 as VPA), is_a1: true, },
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
        let oldOp = this.state.lastOperation
        this.updateResultAut(oldOp.operation, oldOp.is_a1)
      } else {
        alert("Not implemented")
      }
    }
    this.setState({ showRegexSetter: false })
  }

  createResultAut(operation: Operation, is_a1 = true, a1: VPA, a2: VPA) {
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
    let opeartionList = { a1, a2, operation, res, is_a1 }
    return { lastOperation: opeartionList }
  }

  updateResultAut(operation: Operation, is_a1 = true) {
    this.setState((state) => {
      return this.createResultAut(operation, is_a1, state.a1 as VPA, state.a2 as VPA)
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
    let { a1: r1, a2: r2, lastOperation: opeartionList } = this.state
    this.setState(() => { return { a1: r2, a2: r1 } })
    if ((["/", "~"] as Operation[]).includes(opeartionList.operation))
      this.updateResultAut(opeartionList.operation, opeartionList.is_a1)
  }

  createOpHeader() {
    let op = this.state.lastOperation.operation
    let isUnary = unaryOp.includes(op)
    let is_a1 = this.state.lastOperation.is_a1
    return this.operationToString(op) + (isUnary ? `(A${is_a1 ? 1 : 2})` : "(A1, A2)")
  }

  createCardAutomaton(r: FSM<StateDFA | StateVPA>, pos: number) {
    return <Card className="border-primary text-primary">
      <Card.Header className={FLEX_CENTER + " justify-content-between"}>
        {this.state.fsmType} - Name: A{pos}
        <BootstrapReboot className="text-hover" onClick={() =>
          this.setState({ showRegexSetter: true, changeRegexA1: pos === 1 })} />
      </Card.Header>
      <Card.Body className="py-1 px-0">
        <div className={FLEX_CENTER} style={{ minHeight: "130px" }}><GraphDotRender dot={r} /></div>
        <div className={FLEX_CENTER}><Button onClick={() => this.updateResultAut("~", pos === 1)}>Complement(A{pos})</Button></div>
      </Card.Body>
    </Card>
  }

  createAccordionItem(p: { key: string, aut: FSM<StateDFA | StateVPA>, isMinimized: boolean }) {
    let aut = p.isMinimized ? p.aut.minimize() : p.aut
    let colorPutInDiv = "secondary"
    return <Accordion.Item eventKey={p.key} >
      <Accordion.Header>
        {this.createOpHeader()} - {p.isMinimized ? "Minimized" : "Normal"}
      </Accordion.Header>
      <Accordion.Body className="justify-content-center">
        <div className="d-flex text-center position-absolute flex-column">
          <p className={`m-0 p-1 text-${colorPutInDiv} border rounded-top border-bottom-0 border-${colorPutInDiv}`}
            style={{ fontSize: "0.875rem" }}>Put in</p>
          <ButtonGroup>
            <Button variant={"outline-" + colorPutInDiv} size="sm" style={{ borderTopLeftRadius: 0 }} onClick={() => {
              this.setState((state) => {
                return { ...this.createResultAut(state.lastOperation.operation, true, aut as VPA, state.a2 as VPA), a1: aut }
              })
            }}>A1</Button>
            <Button variant={"outline-" + colorPutInDiv} size="sm" style={{ borderTopRightRadius: 0 }} onClick={() => {
              this.setState((state) => {
                return { ...this.createResultAut(state.lastOperation.operation, false, state.a1 as VPA, aut as VPA), a2: aut }
              })
            }}>A2</Button>
          </ButtonGroup>
        </div>
        <GraphDotRender dot={aut} />
      </Accordion.Body>
    </Accordion.Item>
  }

  createBinaryOperatorSwitcher() {
    return <>
      {binaryOp.map(e => <Button key={e} onClick={() => this.updateResultAut(e)}>{e}</Button>)}
      <Button onClick={() => this.switchAutomata()}>⇌</Button>
    </>
  }

  render(): React.ReactNode {
    let lastOp = this.state.lastOperation
    return <>
      <Dialog fn={this.setRegex.bind(this)} show={this.state.showRegexSetter} />
      <Row>
        <Col className="mb-3 mb-sm-0" sm={5}>{this.createCardAutomaton(this.state.a1, 1)}</Col>
        <Col className="d-flex text-center align-self-center justify-content-center">
          <ButtonGroup vertical className="secondary d-none d-sm-inline-flex">
            {this.createBinaryOperatorSwitcher()}</ButtonGroup>
          <ButtonGroup className="secondary d-sm-none">
            {this.createBinaryOperatorSwitcher()}</ButtonGroup>
        </Col>
        <Col className="mt-3 mt-sm-0" sm={5}>{this.createCardAutomaton(this.state.a2, 2)}</Col>
      </Row>
      <Accordion defaultActiveKey={['0']} alwaysOpen className="mt-3">
        {this.createAccordionItem({ key: "0", aut: lastOp.res, isMinimized: false })}
        {this.state.a1 instanceof VPA ? <></> :
          this.createAccordionItem({ key: "1", aut: lastOp.res, isMinimized: true })}
      </Accordion>
    </>
  }
}

export class DFAViewer extends FSM_Viewer { }
export class VPAViewer extends FSM_Viewer { }