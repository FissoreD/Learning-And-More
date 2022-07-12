import { Component, ReactNode } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

interface ChangeCnt { change_cnt: (algo: "L*" | "NL*" | "TTT") => void; }

export class NavBar extends Component<ChangeCnt> {
  render(): ReactNode {
    return (
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Learning</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Automata</Nav.Link>
              <NavDropdown title="Algorithms" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={() => this.props.change_cnt("L*")}>L*</NavDropdown.Item>
                <NavDropdown.Item onClick={() => this.props.change_cnt("NL*")}>NL*</NavDropdown.Item>
                <NavDropdown.Item onClick={() => this.props.change_cnt("TTT")}>TTT</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">TODO</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    )
  }
}