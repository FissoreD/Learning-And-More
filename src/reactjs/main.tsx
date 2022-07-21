import React from "react";
import { Container, Row } from "react-bootstrap";
import AutomatonContainerC from "./automaton/automaton_container_c";
import TestVPAViewer from "./automaton/TestVpaViewer";
import LearnerContainerC from "./learning/learner_containerC";
import { AlgosNavBar, NavBar } from "./nav_bar";

interface Prop { cnt: React.ReactElement }

export class Main extends React.Component<{}, Prop> {
  constructor(prop: {}) {
    super(prop)
    this.state = { cnt: <LearnerContainerC /> }
  }

  swicthContent(section: AlgosNavBar): void {
    let cnt: React.ReactElement;
    switch (section) {
      case "Automaton": cnt = <AutomatonContainerC />; break;
      case "Learning": cnt = <LearnerContainerC />; break;
      case "TestVPAViewer": cnt = <TestVPAViewer />; break;
      default: throw new Error("Should not be here")
    }
    this.setState(() => { return { cnt } })
  }

  render(): React.ReactNode {
    return <>
      <NavBar changeCnt={this.swicthContent.bind(this)} />
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