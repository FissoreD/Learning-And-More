import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { House } from "react-bootstrap-icons";
import { AlgosNavBarType, ALGO_NAVBAR_LIST } from "../..";

interface ChangeCnt { changeCnt: (algo: AlgosNavBarType) => void; }

export class NavBar extends React.Component<ChangeCnt> {
  render(): React.ReactElement {
    let links = ALGO_NAVBAR_LIST.slice(1).map((e, pos) => <Nav.Link key={pos} onClick={() => {
      this.props.changeCnt(e);
    }}>{e}</Nav.Link>)
    return (
      <Navbar bg="light" expand="sm" className="mb-2">
        <Container>
          <Navbar.Brand className="text-hover" onClick={() => this.props.changeCnt("Home")}><House /></Navbar.Brand>
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