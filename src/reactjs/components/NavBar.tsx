import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Bank } from "react-bootstrap-icons";
import { AlgosNavBarType, ALGO_NAVBAR_LIST } from "../..";


interface ChangeCnt { changeCnt: (algo: AlgosNavBarType) => void; }

export class NavBar extends React.Component<ChangeCnt> {
  render(): React.ReactElement {
    let links = ALGO_NAVBAR_LIST.map((e, pos) => <Nav.Link key={pos} onClick={(event) => {
      this.props.changeCnt(e);
    }}>{e}</Nav.Link>)
    return (
      <Navbar bg="light" expand="lg" className="mb-2">
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