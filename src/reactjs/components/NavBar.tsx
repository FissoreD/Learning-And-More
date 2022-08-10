import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { House } from "react-bootstrap-icons";
import { ALGO_NAVBAR_LIST } from "../..";
import { logRender } from "../globalFunctions";
import { AlgosNavBarType } from "../redux/storeTypes";

interface ChangeCnt { changeCnt: (algo: AlgosNavBarType) => void; }

export default class NavBar extends React.Component<ChangeCnt> {
  render(): React.ReactElement {
    logRender("NavBar");
    let links = ALGO_NAVBAR_LIST.slice(1).map((e, pos) => <Nav.Link key={pos} onClick={() => {
      this.props.changeCnt(e);
    }}>{e}</Nav.Link>)
    return (
      <Navbar bg="light" expand="sm" className="mb-2">
        <Container>
          <Navbar.Brand className="my-hover" onClick={() => this.props.changeCnt("Home")}><House /></Navbar.Brand>
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