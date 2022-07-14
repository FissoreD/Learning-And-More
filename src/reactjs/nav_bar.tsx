import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

export type AlgosNavBar = "Home" | "Automaton" | "Learning"

interface ChangeCnt { change_cnt: (algo: AlgosNavBar) => void; }

export class NavBar extends React.Component<ChangeCnt> {
  render(): React.ReactElement {
    let links = (["Automaton", "Learning"] as AlgosNavBar[]).map((e, pos) => <Nav.Link key={pos} onClick={() => this.props.change_cnt(e)}>{e}</Nav.Link>)
    return (
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand >Learning</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <>{links}</>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )
  }
}