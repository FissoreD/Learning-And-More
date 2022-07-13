import { Component, ReactElement } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

export type AlgosNavBar = "Automaton" | "Learning"

interface ChangeCnt { change_cnt: (algo: AlgosNavBar) => void; }

export class NavBar extends Component<ChangeCnt> {
  render(): ReactElement {
    return (
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand >Learning</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link >Home</Nav.Link>
              <Nav.Link onClick={() => alert("Not implemented")}>Automata</Nav.Link>
              <Nav.Link onClick={() => this.props.change_cnt("Learning")}>Learning</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )
  }
}