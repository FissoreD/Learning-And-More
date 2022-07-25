import React from "react";
import { ButtonGroup } from "react-bootstrap";
import TTT from "../../lib/learning/learners/discrimination_tree/TTT";
import L_star from "../../lib/learning/learners/observation_table/L_star";
import NL_star from "../../lib/learning/learners/observation_table/NL_Star";
import { TeacherAutomaton } from "../../lib/learning/teachers/TeacherAutomaton";
import TTTC from "./discrimination_tree/TTT_C";
import LStarC from "./observation_table/L_StarC";
import NLStarC from "./observation_table/NL_StarC";

export type LearnerAlgo = "L" | "NL" | "TTT" | "TTT-VPA"
interface State { cnt: React.ReactElement, regex: string }
interface Prop { cnt: LearnerAlgo }

let regex = "(a+b)*a(a+b)(a+b)"
export default class LearnerContainerC extends React.Component<Prop, State> {
  constructor(prop: Prop) {
    super(prop)
    this.state = {
      cnt: this.giveAlgo(prop.cnt, regex),
      regex
    }
  }

  giveAlgo(algo: LearnerAlgo, regex?: string) {
    let cnt;
    let teacher = new TeacherAutomaton({
      automaton: (this.state ? this.state.regex : regex)!,
      type: "Regex"
    })
    switch (algo) {
      case "NL": cnt = <NLStarC changeRegexContainer={this.changeRegex.bind(this)} name={"NL-Star"} learner={new NL_star(teacher)} />; break;
      case "TTT": cnt = <TTTC changeRegexContainer={this.changeRegex.bind(this)} name={"TTT"} learner={new TTT(teacher)} />; break;
      case "TTT-VPA":
      //cnt = <TTTC changeRegexContainer={this.changeRegex.bind(this)} name={"TTT"} learner={new TTT - VPA(teacher)} /> break;
      default:
        algo = "L"
        cnt = <LStarC changeRegexContainer={this.changeRegex.bind(this)} name={"L-Star"} learner={new L_star(teacher)} />;
    }
    window.history.pushState("", "", "/" + window.location.pathname.split("/")[1] + "/" + algo)
    return cnt
  }

  changeCnt(algo: LearnerAlgo) {
    this.setState({ cnt: this.giveAlgo(algo) })
  }

  changeRegex(regex: string) {
    this.setState({ regex })
  }

  render(): React.ReactElement {
    /* @todo : must give a unique key to the generated elements in the map*/
    let algos: LearnerAlgo[] = ["L", "NL", "TTT"]
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