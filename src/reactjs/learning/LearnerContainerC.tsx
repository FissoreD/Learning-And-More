import React from "react";
import { ButtonGroup } from "react-bootstrap";
import TTT from "../../lib/learning/learners/discrimination_tree/TTT";
import L_star from "../../lib/learning/learners/observation_table/L_star";
import NL_star from "../../lib/learning/learners/observation_table/NL_Star";
import { TeacherAutomaton } from "../../lib/learning/teachers/TeacherAutomaton";
import TTTC from "./discrimination_tree/TTT_C";
import LStarC from "./observation_table/L_StarC";
import NL_StarC from "./observation_table/NL_StarC";

interface State { cnt: React.ReactElement, regex: string }

let regex = "(a+b)*a(a+b)(a+b)"
export default class LearnerContainerC extends React.Component<{}, State> {
  constructor(prop: {}) {
    super(prop)
    this.state = {
      cnt: <LStarC changeRegexContainer={this.changeRegex.bind(this)} name={"L-Star"} learner={new L_star(new TeacherAutomaton({
        automaton: regex,
        type: "Regex"
      }))} />,
      regex
    }
  }

  changeCnt(algo: "L*" | "NL*" | "TTT") {
    let cnt: React.ReactElement;
    let teacher = new TeacherAutomaton({
      automaton: this.state.regex,
      type: "Regex"
    })
    switch (algo) {
      case "L*": cnt = <LStarC changeRegexContainer={this.changeRegex.bind(this)} name={"L-Star"} learner={new L_star(teacher)} />; break;
      case "NL*": cnt = <NL_StarC changeRegexContainer={this.changeRegex.bind(this)} name={"NL-Star"} learner={new NL_star(teacher)} />; break;
      case "TTT": cnt = <TTTC changeRegexContainer={this.changeRegex.bind(this)} name={"TTT"} learner={new TTT(teacher)} />; break
    }
    this.setState({ cnt })
  }

  changeRegex(regex: string) {
    this.setState({ regex })
  }

  render(): React.ReactElement {
    /* @todo : must give a unique key to the generated elements in the map*/
    let algos: ("L*" | "NL*" | "TTT")[] = ["L*", "NL*", "TTT"]
    let createButtons = () => {
      return (
        <ButtonGroup className="d-flex" style={{ maxWidth: "70%", width: "100%" }}>{algos.map(
          (algo, pos) =>
            <React.Fragment key={pos}>
              <input type="radio" className="btn-check" name="btnradio" id={"btnradio" + pos} autoComplete="off" defaultChecked={pos === 0} />
              <label className="btn btn-outline-primary" htmlFor={"btnradio" + pos} onClick={() => this.changeCnt(algo)}>{algo}</label>
            </React.Fragment>)}
        </ButtonGroup>)
    }
    return < >
      <div className="d-flex justify-content-center my-2">
        {createButtons()}
      </div>
      {this.state.cnt}
    </ >
  }
}