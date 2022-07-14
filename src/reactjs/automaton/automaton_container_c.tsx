import React from "react";
import { Button, ButtonGroup, Card, Col, Row } from "react-bootstrap";
import Automaton from "../../lib/automaton/fsm/DFA_NFA";
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
    a2: Automaton,
    res: Automaton
  }[]
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
          res: Automaton.regex_to_automaton(regex1).union(Automaton.regex_to_automaton(regex2)).minimize()
        }
      ]
    }
  }

  create_card_automaton(r: string, pos: number) {
    return <Card className="h-100 border-primary text-primary">
      <Card.Header>Automaton A{pos}</Card.Header>
      <div className="h-100 d-flex justify-content-center align-items-center">
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

  add_new_aut(operation: Operation, is_one = true) {
    let { r1, r2 } = this.state
    let [a1, a2] = [r1, r2].map(e => Automaton.regex_to_automaton(e))
    let res: Automaton;
    switch (operation) {
      case "/": res = a1.difference(a2).minimize(); break;
      case "∩": res = a1.intersection(a2).minimize(); break;
      case "∪": res = a1.union(a2).minimize(); break;
      case "△": res = a1.symmetric_difference(a2).minimize(); break;
      case "~": res = (is_one ? a1 : a2).complement(); break;
      case "Det": res = a1.determinize().minimize(); break;
      default: throw new Error("Should not be here")
    }
    let opeartionList = this.state.opeartionList
    opeartionList = [{ a1, a2, operation, res }]
    this.setState({ opeartionList })
  }

  render(): React.ReactNode {
    return <>
      <Row>
        <Col xs={5}>{this.create_card_automaton(this.state.r1, 1)}</Col>
        <Col className="d-flex text-center align-self-center justify-content-center">
          <ButtonGroup vertical className="secondary">
            {binaryOp.map(e => <Button key={e} onClick={() => this.add_new_aut(e)}>{e}</Button>)}
            <Button onClick={() => this.setState({ r1: this.state.r2, r2: this.state.r1 })}>⇌</Button>
          </ButtonGroup>
        </Col>
        <Col xs={5}>{this.create_card_automaton(this.state.r2, 2)}</Col>
      </Row>
      <div className="my-2">
        {this.state.opeartionList.map((e, pos) =>
          <Card key={pos} className="border-primary text-primary my-2 py-2">
            <Row className="justify-content-center">
              <Col xs={12} className="align-self-center" ><AutomatonC automaton={e.res} /></Col>
            </Row>
          </Card>)}
      </div>
    </>
  }
}