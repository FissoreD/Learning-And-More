import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Bank } from "react-bootstrap-icons";
import { AlgosNavBar } from "../..";


interface ChangeCnt { changeCnt: (algo: AlgosNavBar) => void; }

export class NavBar extends React.Component<ChangeCnt> {
  render(): React.ReactElement {
    let links = (["Automaton", "Learning", "TestVPAViewer"] as AlgosNavBar[]).map((e, pos) => <Nav.Link key={pos} onClick={() => {
      this.props.changeCnt(e);
      if (window.location.pathname.split("/")[1] !== e)
        window.history.pushState("", "", "/" + e);
    }}>{e}</Nav.Link>)
    return (
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand ><Bank /></Navbar.Brand>
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