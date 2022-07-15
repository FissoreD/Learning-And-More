import React from "react";
import { Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import { BootstrapReboot } from "react-bootstrap-icons";
import Automaton from "../../lib/automaton/fsm/DFA_NFA";
import Dialog from "../dialog";
import { AutomatonC } from "./automaton";

type Operation = "∪" | "∩" | "△" | "/" | "Det" | "~"
const binaryOp: Operation[] = ["∪", "∩", "△", "/"]
const unaryOp: Operation[] = ["Det", "~"]

interface State {
  r1: string,
  r2: string,
  opeartionList: {
    a1: Automaton,
    operation: Operation,
    is_a1: boolean,
    a2: Automaton,
    res: Automaton
  }[],
  show_regex_setter: boolean,
  change_regex_a1: boolean
}

let regex1 = "(ac+b)*(b+c)"
let regex2 = "(a+b)*c"

export default class AutomatonContainerC extends React.Component<{}, State>{

  constructor(props: {}) {
    super(props)
    this.state = {
      r1: regex1,
      r2: regex2,
      opeartionList: [
        {
          a1: Automaton.regex_to_automaton(regex1),
          a2: Automaton.regex_to_automaton(regex2),
          operation: "∪",
          res: Automaton.regex_to_automaton(regex1).union(Automaton.regex_to_automaton(regex2)).minimize(),
          is_a1: true,
        }
      ],
      show_regex_setter: false,
      change_regex_a1: true
    }
  }

  set_regex(regex: string | undefined) {
    if (regex)
      this.setState((state) => {
        console.log(state);
        if (state.change_regex_a1) {
          console.log("HERE");
          return { r1: regex }
        } else {
          console.log("THERE");
          return { r2: regex }
        }
      })
    this.setState({ show_regex_setter: false })
    let old_op = this.state.opeartionList[0]
    this.add_new_aut(old_op.operation, old_op.is_a1)
  }

  create_card_automaton(r: string, pos: number) {
    return <Card className="h-100 border-primary text-primary">
      <Card.Header>
        Automaton A{pos}
        <a className="float-end" onClick={() => {
          this.setState({ show_regex_setter: true, change_regex_a1: pos === 1 });
        }}><BootstrapReboot /></a>
      </Card.Header>
      <div className="h-100 d-flex justify-content-center align-items-center" style={{ minHeight: "130px" }}>
        <AutomatonC automaton={Automaton.regex_to_automaton(r)} />
      </div>
      <Card.Body className="py-1">
        <Card.Title className="my-0 text-nowrap text-center" style={{ overflowY: "hidden" }}>{r}</Card.Title>
      </Card.Body>
      <hr className="my-0" />
      <Card.Body className="py-1 text-center">
        <ButtonGroup>
          <Button onClick={() => this.add_new_aut("~", pos === 1)}>Complement(A{pos})</Button>
          {/* <Button onClick={() => this.add_new_aut("Det")}>Det(A)</Button> */}
        </ButtonGroup>
      </Card.Body>
    </Card>
  }

  add_new_aut(operation: Operation, is_a1 = true) {
    this.setState((state) => {
      let { r1, r2 } = state
      let [a1, a2] = [r1, r2].map(e => Automaton.regex_to_automaton(e))
      let res: Automaton;
      switch (operation) {
        case "/": res = a1.difference(a2).minimize(); break;
        case "∩": res = a1.intersection(a2).minimize(); break;
        case "∪": res = a1.union(a2).minimize(); break;
        case "△": res = a1.symmetric_difference(a2).minimize(); break;
        case "~": res = (is_a1 ? a1 : a2).complement(); break;
        case "Det": res = a1.determinize().minimize(); break;
        default: throw new Error("Should not be here")
      }
      let opeartionList = state.opeartionList
      opeartionList = [{ a1, a2, operation, res, is_a1 }]
      return { opeartionList }
    })
  }

  operation_to_string(op: Operation) {
    switch (op) {
      case "∪": return "Union"
      case "∩": return "Intersection"
      case "/": return "Difference"
      case "△": return "Symmetric Difference"
      case "~": return "Complement"
      case "Det": return "Determinization"
    }
  }

  switch_automata() {
    let { r1, r2, opeartionList } = this.state
    this.setState(() => { return { r1: r2, r2: r1 } })
    if ((["/", "~"] as Operation[]).includes(opeartionList[0].operation)) this.add_new_aut(opeartionList[0].operation, opeartionList[0].is_a1)
  }

  create_op_header(op: Operation, is_a1: boolean) {
    let isUnary = unaryOp.includes(op)
    if (isUnary)
      return this.operation_to_string(op) + `(A${is_a1 ? 1 : 2})`
    else
      return this.operation_to_string(op) + "(A1, A2)"
  }

  render(): React.ReactNode {
    return <>
      <Dialog fn={this.set_regex.bind(this)} show={this.state.show_regex_setter} />
      <Row>
        <Col xs={5}>{this.create_card_automaton(this.state.r1, 1)}</Col>
        <Col className="d-flex text-center align-self-center justify-content-center">
          <ButtonGroup vertical className="secondary">
            {binaryOp.map(e => <Button key={e} onClick={() => this.add_new_aut(e)}>{e}</Button>)}
            <Button onClick={() => this.switch_automata()}>⇌</Button>
          </ButtonGroup>
        </Col>
        <Col xs={5}>{this.create_card_automaton(this.state.r2, 2)}</Col>
      </Row>
      <div className="my-2">
        {this.state.opeartionList.map((e, pos) =>
          <Card key={pos} className="border-primary text-primary my-2">
            <Card.Header>{this.create_op_header(e.operation, e.is_a1)}</Card.Header>
            <Row className="justify-content-center">
              <Col xs={12} className="align-self-center" ><AutomatonC automaton={e.res} /></Col>
            </Row>
          </Card>)}
      </div>
    </>
  }
}