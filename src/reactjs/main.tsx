import { Component, ReactElement, ReactNode } from "react";
import { Container, Row } from "react-bootstrap";
import LearnerContainerC from "./learning/learner_containerC";
import { AlgosNavBar, NavBar } from "./nav_bar";

interface Prop { cnt: ReactElement }

export class Main extends Component<{}, Prop> {
  constructor(prop: {}) {
    super(prop)
    this.state = { cnt: <LearnerContainerC /> }
  }

  swicth_content(section: AlgosNavBar): void {
    let cnt: ReactElement;
    switch (section) {
      case "Automaton": cnt = <></>; break;
      case "Learning": cnt = <LearnerContainerC />; break;
      default: throw new Error("Should not be here")
    }
    this.setState({ cnt })
  }

  render(): ReactNode {
    return <>
      <NavBar change_cnt={this.swicth_content} />
      <Container >
        <Row className="justify-content-center" >        
          <div className="col-xl-8 col-md-10">
            {this.state.cnt}
          </div >
        </Row>
        </Container>
    </>
  }
}