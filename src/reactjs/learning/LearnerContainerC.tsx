import React from "react";
import { Col, Row } from "react-bootstrap";
import TTT from "../../lib/learning/learners/discrimination_tree/TTT_DFA";
import L_star from "../../lib/learning/learners/observation_table/L_star";
import NL_star from "../../lib/learning/learners/observation_table/NL_Star";
import { TeacherAutomaton } from "../../lib/learning/teachers/TeacherDFA";
import { createButtonGroupAlgoSwitcher, setFromPosition } from "../globalFunctions";
import { URL_SEPARATOR } from "../globalVars";
import TTTC from "./discrimination_tree/TTT_C";
import LStarC from "./observation_table/L_StarC";
import NLStarC from "./observation_table/NL_StarC";

export type LearnerAlgo = "L" | "NL" | "TTT" | "TTT-VPA"
let algos: LearnerAlgo[] = ["L", "NL", "TTT"]
interface State { cnt: string, regex: string, pos: number }
interface Prop { cnt: string }

let regex = "(a+b)*a(a+b)(a+b)"
export default class LearnerContainerC extends React.Component<Prop, State> {
  constructor(prop: Prop) {
    super(prop)
    let [fstElt, sndElt] = prop.cnt.split(URL_SEPARATOR) as [LearnerAlgo, string, string[]]
    this.state = {
      cnt: algos.includes(fstElt) ? fstElt : "L",
      regex,
      pos: parseInt(sndElt) || 0
    }
  }

  giveAlgo(algo: string, regex?: string) {
    let cnt;
    let teacher = new TeacherAutomaton({
      automaton: (this.state ? this.state.regex : regex)!,
      type: "Regex"
    })
    switch (algo) {
      case "NL":
        cnt = <NLStarC pos={this.state.pos} changeRegexContainer={this.changeRegex.bind(this)} name={"NL-Star"} learner={new NL_star(teacher)} />;
        break;
      case "TTT":
        cnt = <TTTC pos={this.state.pos} changeRegexContainer={this.changeRegex.bind(this)} name={"TTT"} learner={new TTT(teacher)} />;
        break;
      case "TTT-VPA":
      //cnt = <TTTC changeRegexContainer={this.changeRegex.bind(this)} name={"TTT"} learner={new TTT - VPA(teacher)} /> break;
      default:
        algo = "L"
        cnt = <LStarC pos={this.state.pos} changeRegexContainer={this.changeRegex.bind(this)} name={"L-Star"} learner={new L_star(teacher)} />;
    }
    setFromPosition(algo, 1)
    return cnt
  }

  changeCnt(algo: string) {
    this.setState({ cnt: algos.includes(algo as LearnerAlgo) ? algo : "L", pos: 0 })
  }

  changeRegex(regex: string) {
    this.setState({ regex })
  }

  render(): React.ReactElement {
    return < >
      <Row>
        <Col sm={"auto"}>{createButtonGroupAlgoSwitcher({ labelList: algos, currentLabel: this.state.cnt, onclickOp: this.changeCnt.bind(this) })}</Col>
        <Col>{this.giveAlgo(this.state.cnt as LearnerAlgo)}</Col>
      </Row>
    </ >
  }
}