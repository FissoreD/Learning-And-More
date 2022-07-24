import React from "react";
import { Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import { BootstrapReboot } from "react-bootstrap-icons";
import AlphabetVPA from "../../lib/automaton/context_free/AlphabetVPA";
import StateVPA from "../../lib/automaton/context_free/StateVPA";
import VPA from "../../lib/automaton/context_free/VPA";
import { todo } from "../../lib/tools";
import Dialog from "../components/Dialog";
import GraphDotRender from "../components/GraphDotRender";

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

interface State {
  a1: VPA,
  a2: VPA,
  opeartionList: {
    a1: VPA,
    operation: Operation,
    is_a1: boolean,
    a2: VPA,
    res: VPA
  }[],
  showRegexSetter: boolean,
  changeRegexA1: boolean
}

let a1 = createVPA1()
let a2 = createVPA2()

export default class AutomatonContainerC extends React.Component<{}, State>{

  constructor(props: {}) {
    super(props)
    this.state = {
      a1, a2,
      opeartionList: [
        {
          a1: a1,
          a2: a2,
          operation: "∪",
          res: a1.union(a2),
          is_a1: true,
        }
      ],
      showRegexSetter: false,
      changeRegexA1: true
    }
  }

  setRegex(regex: string | undefined) {
    if (regex) {
      throw todo()
      // this.setState((state) => {
      //   if (state.changeRegexA1) {
      //     return { a1: regex!, a2: state.a2 }
      //   } else {
      //     return { a1: state.a1, a2: regex! }
      //   }
      // })
      let old_op = this.state.opeartionList[0]
      this.addNewAut(old_op.operation, old_op.is_a1)
    }

    this.setState({ showRegexSetter: false })
  }

  createCardAutomaton(r: VPA, pos: number) {
    return <Card className="h-100 border-primary text-primary">
      <Card.Header>
        Automaton A{pos}
        {// eslint-disable-next-line
          <a className="float-end" onClick={() => {
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
          {/* <Button onClick={() => this.add_new_aut("Det")}>Det(A)</Button> */}
        </ButtonGroup>
      </Card.Body>
    </Card>
  }

  addNewAut(operation: Operation, is_a1 = true) {
    this.setState((state) => {
      let { a1: r1, a2: r2 } = state
      let [a1, a2] = [r1, r2].map(e => e)
      let res: VPA;
      /** @todo: Minimize them after operation */
      switch (operation) {
        case "/": res = a1.difference(a2); break;
        case "∩": res = a1.intersection(a2); break;
        case "∪": res = a1.union(a2); break;
        case "△": res = a1.symmetricDifference(a2); break;
        case "~": res = (is_a1 ? a1 : a2).complement(); break;
        case "Det": res = a1.determinize(); break;
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
        <Col xs={5}>{this.createCardAutomaton(this.state.a1, 1)}</Col>
        <Col className="d-flex text-center align-self-center justify-content-center">
          <ButtonGroup vertical className="secondary">
            {binaryOp.map(e => <Button key={e} onClick={() => this.addNewAut(e)}>{e}</Button>)}
            <Button onClick={() => this.switchAutomata()}>⇌</Button>
          </ButtonGroup>
        </Col>
        <Col xs={5}>{this.createCardAutomaton(this.state.a2, 2)}</Col>
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
