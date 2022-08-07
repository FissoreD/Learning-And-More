import React from "react";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import VPA from "../../lib/automaton/context_free/VPA";
import { VPAList } from "../../lib/__test__/VPAforTest";

interface Prop { fn: (a: VPA | undefined) => void, show: boolean }
interface State { regex: string | undefined }

export default class VPASwitcher extends React.Component<Prop, State>{

  sendChosenVPA(vpa: VPA) {
    this.props.fn(vpa)
  }

  quit() {
    this.props.fn(undefined)
  }

  alphabetToVpa(vpa: VPA) {
    let { INT, CALL, RET } = vpa.alphabet
    return <div>
      <h5 className="text-center">Alphabet</h5>
      <p>
        <b>CALL</b>: [ {CALL.join(", ")} ]<br />
        <b>RET</b>: [ {RET.join(", ")} ]<br />
        <b>INT</b>: [ {INT.join(", ")} ]<br />
      </p>
    </div>
  }

  createCard = (title: string | number, vpa: VPA) => {
    return <Col sm="6">
      <Card className="cursor h-100" onClick={() => this.props.fn(vpa)}>
        <Card.Body>
          <Card.Title>VPA {title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted"><pre>{vpa.grammar}</pre></Card.Subtitle>
          <Card.Text>{this.alphabetToVpa(vpa)}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  }

  render(): React.ReactNode {
    let len = Math.ceil(VPAList.length / 2)
    let vpas = new Array(len).fill(0).map((_, pos) => [VPAList[pos * 2], VPAList[pos * 2 + 1]])
    console.log(vpas);

    return <Modal show={this.props.show} onHide={() => this.quit()}>
      <Modal.Header closeButton>
        <Modal.Title>VPA chooser</Modal.Title>
      </Modal.Header>
      <Modal.Body className="overflow-auto" style={{ height: "15rem" }}>
        {vpas.map(([a, b], pos) =>
          <Row key={pos} className="pb-3">
            {this.createCard(pos * 2 + 1, a)}
            {b ? this.createCard((pos + 1) * 2, b) : <></>}
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => this.quit()}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  }
}