import React from "react";
import { Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import { BootstrapReboot } from "react-bootstrap-icons";
import Automaton from "../../lib/automaton/regular/DFA_NFA";
import Dialog from "../components/Dialog";
import GraphDotRender from "../components/GraphDotRender";

type Operation = "∪" | "∩" | "△" | "/" | "Det" | "~"
const binaryOp: Operation[] = ["∪", "∩", "△", "/"]
const unaryOp: Operation[] = ["Det", "~"]

interface StateReact {
  r1: string,
  r2: string,
  opeartionList: {
    a1: Automaton,
    operation: Operation,
    is_a1: boolean,
    a2: Automaton,
    res: Automaton
  }[],
  showRegexSetter: boolean,
  changeRegexA1: boolean
}

let regex1 = "(ac+b)*(b+c)"
let regex2 = "(a+b)*c"

export default class AutomatonContainerC extends React.Component<{}, StateReact>{

  constructor(props: {}) {
    super(props)
    this.state = {
      r1: regex1,
      r2: regex2,
      opeartionList: [
        {
          a1: Automaton.regexToAutomaton(regex1),
          a2: Automaton.regexToAutomaton(regex2),
          operation: "∪",
          res: Automaton.regexToAutomaton(regex1).union(Automaton.regexToAutomaton(regex2)).minimize(),
          is_a1: true,
        }
      ],
      showRegexSetter: false,
      changeRegexA1: true
    }
  }

  setRegex(regex: string | undefined) {
    if (regex)
      this.setState((state) => {
        if (state.changeRegexA1) {
          return { r1: regex!, r2: state.r2 }
        } else {
          return { r1: state.r1, r2: regex! }
        }
      })
    this.setState({ showRegexSetter: false })
    let old_op = this.state.opeartionList[0]
    this.addNewAut(old_op.operation, old_op.is_a1)
  }

  createCardAutomaton(r: string, pos: number) {
    return <Card className="h-100 border-primary text-primary">
      <Card.Header>
        Automaton A{pos}
        {// eslint-disable-next-line
          <a className="float-end" onClick={() => {
            this.setState({ showRegexSetter: true, changeRegexA1: pos === 1 });
          }}><BootstrapReboot /></a>}
      </Card.Header>
      <div className="h-100 d-flex justify-content-center align-items-center" style={{ minHeight: "130px" }}>
        <GraphDotRender dot={Automaton.regexToAutomaton(r)} />
      </div>
      <Card.Body className="py-1">
        <Card.Title className="my-0 text-nowrap text-center" style={{ overflowY: "hidden" }}>{r}</Card.Title>
      </Card.Body>
      <hr className="my-0" />
      <Card.Body className="py-1 text-center">
        <ButtonGroup>
          <Button onClick={() => this.addNewAut("~", pos === 1)}>Complement(A{pos})</Button>
          {/* <Button onClick={() => this.add_new_aut("Det")}>Det(A)</Button> */}
        </ButtonGroup>
      </Card.Body>
    </Card>
  }

  addNewAut(operation: Operation, is_a1 = true) {
    this.setState((state) => {
      let { r1, r2 } = state
      let [a1, a2] = [r1, r2].map(e => Automaton.regexToAutomaton(e))
      let res: Automaton;
      switch (operation) {
        case "/": res = a1.difference(a2).minimize(); break;
        case "∩": res = a1.intersection(a2).minimize(); break;
        case "∪": res = a1.union(a2).minimize(); break;
        case "△": res = a1.symmetricDifference(a2).minimize(); break;
        case "~": res = (is_a1 ? a1 : a2).complement(); break;
        case "Det": res = a1.determinize().minimize(); break;
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
    let { r1, r2, opeartionList } = this.state
    this.setState(() => { return { r1: r2, r2: r1 } })
    if ((["/", "~"] as Operation[]).includes(opeartionList[0].operation)) this.addNewAut(opeartionList[0].operation, opeartionList[0].is_a1)
  }

  createOpHeader(op: Operation, is_a1: boolean) {
    let isUnary = unaryOp.includes(op)
    if (isUnary)
      return this.operationToString(op) + `(A${is_a1 ? 1 : 2})`
    else
      return this.operationToString(op) + "(A1, A2)"
  }

  render(): React.ReactNode {
    return <>
      <Dialog fn={this.setRegex.bind(this)} show={this.state.showRegexSetter} />
      <Row>
        <Col className="mb-3 mb-sm-0" sm={5}>{this.createCardAutomaton(this.state.r1, 1)}</Col>
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
        <Col className="mt-3 mt-sm-0" sm={5}>{this.createCardAutomaton(this.state.r2, 2)}</Col>
      </Row>
      <div className="my-2">
        {this.state.opeartionList.map((e, pos) =>
          <Card key={pos} className="border-primary text-primary my-2">
            <Card.Header>{this.createOpHeader(e.operation, e.is_a1)}</Card.Header>
            <Row className="justify-content-center">
              <Col xs={12} className="align-self-center" ><GraphDotRender dot={e.res} /></Col>
            </Row>
          </Card>)}
      </div>
    </>
  }
}