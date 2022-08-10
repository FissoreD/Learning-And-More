import React, { RefObject } from "react";
import { Accordion, Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import { Eyedropper } from "react-bootstrap-icons";
import VPA from "../../../lib/automaton/context_free/VPA";
import FSM from "../../../lib/automaton/FSM.interface";
import DFA_NFA from "../../../lib/automaton/regular/DFA_NFA";
import { createVPA2, createVPA4, VPAList } from "../../../lib/__test__/VPAforTest";
import Dialog from "../../components/Dialog";
import GraphDotRender from "../../components/DotRender";
import VPASwitcher from "../../components/VPASwitcher";
import { logRender } from "../../globalFunctions";
import { FLEX_CENTER } from "../../globalVars";
import { FSM_Type, Operation } from "../../redux/storeTypes";

const binaryOp: Operation[] = ["\u222a", "∩", "△", "/"]
const unaryOp: Operation[] = ["Det", "~"]

interface ReactState {
  fsmType: FSM_Type,
  a1: FSM,
  a2: FSM,
  lastOperation: {
    operation: Operation,
    is_a1: boolean,
    res: FSM
  },
  showRegexSetter: boolean,
  changeRegexA1: boolean
}

interface ReactProp {
  cnt: string
}


export default class FSMViewer extends React.Component<ReactProp, ReactState>{

  refMinim: RefObject<HTMLDivElement> = React.createRef()
  refNormal: RefObject<HTMLDivElement> = React.createRef()

  constructor(props: ReactProp) {
    super(props)
    this.state = this.changeCnt(props.cnt)
  }

  changeCnt(fsmType: string): ReactState {
    let a1, a2, res;
    switch (fsmType) {
      case "VPA": { a1 = createVPA4(); a2 = createVPA2(); res = a1.union(a2); break; }
      default: {
        a1 = DFA_NFA.regexToAutomaton("(ac+b)*(b+c)")
        a2 = DFA_NFA.regexToAutomaton("(a+b)*c")
        res = a1.union(a2)
        fsmType = "DFA"
        break;
      }
    }
    return {
      fsmType: fsmType as FSM_Type, a1, a2,
      lastOperation: { operation: "\u222a", res, is_a1: true, },
      showRegexSetter: false,
      changeRegexA1: true
    }
  }

  setRegex(regex: string | undefined) {
    if (this.state.fsmType === "DFA")
      this.setFSM(regex ? DFA_NFA.regexToAutomaton(regex) : undefined)
    else
      this.setFSM(regex ? VPAList[parseInt(regex)] : undefined)
  }

  setFSM(fsm: VPA | DFA_NFA | undefined) {
    if (fsm instanceof DFA_NFA) {
      this.setState((state) => {
        if (state.changeRegexA1) {
          return { a1: fsm!, a2: state.a2 }
        } else {
          return { a1: state.a1, a2: fsm! }
        }
      });
      let oldOp = this.state.lastOperation
      this.updateResultAut(oldOp.operation, oldOp.is_a1)
    } else if (fsm instanceof VPA) {
      this.setState((state) => {
        if (state.changeRegexA1) {
          return { a1: fsm!, a2: state.a2 }
        } else {
          return { a1: state.a1, a2: fsm! }
        }
      });
      let oldOp = this.state.lastOperation
      this.updateResultAut(oldOp.operation, oldOp.is_a1)
    }
    this.setState({ showRegexSetter: false })
  }

  createResultAut(operation: Operation, is_a1 = true, a1: FSM, a2: FSM) {
    let res: FSM;
    switch (operation) {
      case "/": res = a1.difference(a2); break;
      case "∩": res = a1.intersection(a2); break;
      case "\u222a": res = a1.union(a2); break;
      case "△": res = a1.symmetricDifference(a2); break;
      case "~": res = (is_a1 ? a1 : a2).complement(); break;
      case "Det": res = a1.determinize(); break;
      default: throw new Error("Should not be here")
    }
    let opeartionList = { a1, a2, operation, res, is_a1 }
    return { lastOperation: opeartionList }
  }

  updateResultAut(operation: Operation, is_a1 = true) {
    this.setState((state) => {
      return this.createResultAut(operation, is_a1, state.a1, state.a2)
    })
    this.updateView()
  }

  updateView() {
    if (this.state.fsmType === "DFA") {
      this.refMinim.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      this.refNormal.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  operationToString(op: Operation) {
    switch (op) {
      case "\u222a": return "Union"
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
    if (["/", "~"].includes(opeartionList.operation))
      this.updateResultAut(opeartionList.operation, opeartionList.is_a1)
  }

  createOpHeader() {
    let op = this.state.lastOperation.operation
    let isUnary = unaryOp.includes(op)
    let is_a1 = this.state.lastOperation.is_a1
    return this.operationToString(op) + (isUnary ? `(A${is_a1 ? 1 : 2})` : "(A1, A2)")
  }

  createCardAutomaton(r: FSM, pos: number) {
    return <Card className="border-primary">
      <Card.Header className={`${FLEX_CENTER} justify-content-between text-primary`}>
        {this.state.fsmType} - Name: A{pos}
        <Eyedropper className="my-hover" onClick={() =>
          this.setState({ showRegexSetter: true, changeRegexA1: pos === 1 })} />
      </Card.Header>
      <Card.Body className="py-1 px-0 d-flex flex-column">
        <div ><GraphDotRender dot={r} /></div>
        <div className={`${FLEX_CENTER}`}><Button className="text-overline" onClick={() => this.updateResultAut("~", pos === 1)}>A{pos}</Button>
        </div>
      </Card.Body>
    </Card>
  }

  createAccordionItem(p: { key: string, aut: FSM, isMinimized: boolean }) {
    let aut = p.isMinimized ? p.aut.minimize() : p.aut
    let colorPutInDiv = "secondary"
    return <Accordion.Item eventKey={p.key} ref={p.isMinimized ? this.refMinim : this.refNormal}>
      <Accordion.Header>
        {this.createOpHeader()} - {p.isMinimized ? "Minimized" : "Normal"}
      </Accordion.Header>
      <Accordion.Body className="justify-content-center py-1 px-0">
        <div className="text-center d-flex justify-content-end me-1">
          <p className={`m-0 p-1 text-${colorPutInDiv} border rounded-start border-end-0 border-${colorPutInDiv}`}
            style={{ fontSize: "0.875rem" }}>Put in</p>
          <ButtonGroup>
            <Button variant={"outline-" + colorPutInDiv} size="sm" style={{ borderRadius: 0 }} onClick={() => {
              this.setState((state) => {
                return { ...this.createResultAut(state.lastOperation.operation, true, aut, state.a2), a1: aut }
              })
            }}>A1</Button>
            <Button variant={"outline-" + colorPutInDiv} size="sm" onClick={() => {
              this.setState((state) => {
                return { ...this.createResultAut(state.lastOperation.operation, false, state.a1, aut), a2: aut }
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
    logRender("FSMViewer");
    let { lastOperation, fsmType, a1, a2, showRegexSetter } = this.state;
    let isDFA = fsmType === "DFA";
    return <>
      {isDFA ?
        <Dialog fn={this.setRegex.bind(this)} show={showRegexSetter} /> :
        <VPASwitcher fn={this.setRegex.bind(this)} show={showRegexSetter} />}
      <Row className="d-flex justify-content-center">
        <Col className="mb-3 mb-sm-0" sm={5}>{this.createCardAutomaton(a1, 1)}</Col>
        <Col sm="auto" className="d-flex text-center align-self-center justify-content-center">
          <ButtonGroup vertical className="secondary d-none d-sm-inline-flex">
            {this.createBinaryOperatorSwitcher()}</ButtonGroup>
          <ButtonGroup className="secondary d-sm-none">
            {this.createBinaryOperatorSwitcher()}</ButtonGroup>
        </Col>
        <Col className="mt-3 mt-sm-0" sm={5}>{this.createCardAutomaton(a2, 2)}</Col>
      </Row>
      <Accordion defaultActiveKey={isDFA ? '0' : '1'} className="my-2">
        {!isDFA ? <></> :
          this.createAccordionItem({ key: "0", aut: lastOperation.res, isMinimized: true })}
        {this.createAccordionItem({ key: "1", aut: lastOperation.res, isMinimized: false })}
      </Accordion>
    </>
  }
}