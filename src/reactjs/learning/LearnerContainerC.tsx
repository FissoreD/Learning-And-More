import React from "react";
import { Col, Row } from "react-bootstrap";
import TTT_DFA from "../../lib/learning/learners/discrimination_tree/TTT_DFA";
import TTT_VPA from "../../lib/learning/learners/discrimination_tree/TTT_VPA";
import L_star from "../../lib/learning/learners/observation_table/L_star";
import NL_star from "../../lib/learning/learners/observation_table/NL_Star";
import { TeacherAutomaton } from "../../lib/learning/teachers/TeacherDFA";
import TeacherVPA from "../../lib/learning/teachers/TeacherVPA";
import { createVPA4 } from "../../lib/__test__/VPAforTest";
import { createButtonGroupAlgoSwitcher, setFromPosition } from "../globalFunctions";
import { URL_SEPARATOR } from "../globalVars";
import TTT_C from "./discrimination_tree/TTT_DFA_C";
import TTT_VPA_C from "./discrimination_tree/TTT_VPA_C";
import LStarC from "./observation_table/L_StarC";
import NLStarC from "./observation_table/NL_StarC";

export type LearnerType = "L*" | "NL*" | "TTT-DFA" | "TTT-VPA"
let algos: LearnerType[] = ["L*", "NL*", "TTT-DFA", "TTT-VPA"]
interface State { cnt: string, regex: string, pos: number }
interface Prop { cnt: string }

let regex = "(a+b)*a(a+b)(a+b)"
export default class LearnerContainerC extends React.Component<Prop, State> {
  constructor(prop: Prop) {
    super(prop)
    let [fstElt, sndElt] = prop.cnt.split(URL_SEPARATOR) as [LearnerType, string, string[]]
    this.state = {
      cnt: algos.includes(fstElt) ? fstElt : "L*",
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
    let algoDef: LearnerType = algo as LearnerType;
    switch (algo) {
      case "NL*":
        cnt = <NLStarC pos={this.state.pos} changeRegexContainer={this.changeRegex.bind(this)} name={"NL*"} learner={new NL_star(teacher)} />;
        break;
      case "TTT-DFA":
        cnt = <TTT_C pos={this.state.pos} changeRegexContainer={this.changeRegex.bind(this)} name={"TTT-DFA"} learner={new TTT_DFA(teacher)} />;
        break;
      case "TTT-VPA":
        cnt = <TTT_VPA_C pos={this.state.pos} changeRegexContainer={this.changeRegex.bind(this)} name={"TTT-VPA"} learner={new TTT_VPA(new TeacherVPA({ automaton: createVPA4() }))} />;
        break
      default:
        algoDef = "L*"
        cnt = <LStarC pos={this.state.pos} changeRegexContainer={this.changeRegex.bind(this)} name={"L*"} learner={new L_star(teacher)} />;
    }
    setFromPosition(algoDef, 1)
    return cnt
  }

  changeCnt(algo: string) {
    this.setState({ cnt: algos.includes(algo as LearnerType) ? algo : "L", pos: 0 })
  }

  changeRegex(regex: string) {
    this.setState({ regex })
  }

  render(): React.ReactElement {
    return < >
      <Row>
        <Col sm={"auto"}>{createButtonGroupAlgoSwitcher({ labelList: algos, currentLabel: this.state.cnt, onclickOp: this.changeCnt.bind(this) })}</Col>
        <Col>{this.giveAlgo(this.state.cnt as LearnerType)}</Col>
      </Row>
    </ >
  }
}