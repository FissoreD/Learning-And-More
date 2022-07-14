import React from "react";
import { Card, ListGroup } from "react-bootstrap";
import Automaton from "../../lib/automaton/fsm/DFA_NFA";
import { AutomatonC } from "./automaton";

let regex = "(a+b)*(b+c)"
export default class AutomatonContainerC extends React.Component<{}, {}>{
  render(): React.ReactNode {
    return <>
      <Card style={{ width: '18rem' }}>
        <AutomatonC automaton={Automaton.regex_to_automaton(regex)} />
        <Card.Body>
          <Card.Title>{regex}</Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>Cras justo odio</ListGroup.Item>
          <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
          <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
        </ListGroup>
        <Card.Body>
          <Card.Link href="#">Card Link</Card.Link>
          <Card.Link href="#">Another Link</Card.Link>
        </Card.Body>
      </Card>
    </>
  }
}