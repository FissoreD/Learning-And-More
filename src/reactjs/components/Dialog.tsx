import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

interface Prop { fn: (a: string | undefined) => void, show: boolean }
interface State { regex: string | undefined }

export default class Dialog extends React.Component<Prop, State> {

  constructor(prop: Prop) {
    super(prop)
    this.state = { regex: undefined }
  }

  sendRegex() {
    this.props.fn(this.state.regex)
  }

  quit() {
    this.props.fn(undefined)
  }

  render(): React.ReactNode {
    return <>
      <Modal show={this.props.show} onHide={() => this.quit()}>
        <Modal.Header closeButton>
          <Modal.Title>Regex setter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            this.sendRegex();
          }}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Enter your regex</Form.Label>
              <Form.Control autoFocus onChange={(e) => { this.setState({ regex: e.target.value }) }} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.quit()}>
            Close
          </Button>
          <Button variant="primary" onClick={() => this.sendRegex()}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  }
}