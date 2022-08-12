import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { House } from "react-bootstrap-icons";
import { connect } from "react-redux";
import { logRender } from "../globalFunctions";
import { setCurrentPage } from "../redux/store";
import { AlgosNavBarType, ALGO_NAVBAR_LIST } from "../redux/storeTypes";

interface ChangeCnt { setCurrentPage: (algo: AlgosNavBarType) => void; }

class NavBar extends React.Component<ChangeCnt> {
  render(): React.ReactElement {
    logRender("NavBar");
    let links = ALGO_NAVBAR_LIST.slice(1).map((e, pos) => <Nav.Link key={pos} onClick={() => {
      this.props.setCurrentPage(e);
    }}>{e}</Nav.Link>)

    return (
      <Navbar bg="light" expand="sm" className="mb-2">
        <Container>
          <Navbar.Brand className="my-hover"
            onClick={() => this.props.setCurrentPage("Home")}><House /></Navbar.Brand>
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

  shouldComponentUpdate = () => false;
}

function mapDispatchToProps(dispatch: Function) {
  return {
    setCurrentPage: (currentPage: AlgosNavBarType) => dispatch(setCurrentPage(currentPage)),
  }
}

export default connect(undefined, mapDispatchToProps)(NavBar)