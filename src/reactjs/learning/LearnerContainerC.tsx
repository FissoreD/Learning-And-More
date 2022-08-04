import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import TTT_DFA from "../../lib/learning/learners/discrimination_tree/TTT_DFA";
import TTT_VPA from "../../lib/learning/learners/discrimination_tree/TTT_VPA";
import L_star from "../../lib/learning/learners/observation_table/L_star";
import NL_star from "../../lib/learning/learners/observation_table/NL_Star";
import { TeacherAutomaton } from "../../lib/learning/teachers/TeacherDFA";
import TeacherVPA from "../../lib/learning/teachers/TeacherVPA";
import { createVPA4 } from "../../lib/__test__/VPAforTest";
import { setUrlFromPosition } from "../globalFunctions";
import { URL_SEPARATOR } from "../globalVars";
import TTT_DFA_C from "./discrimination_tree/TTT_DFA_C";
import TTT_VPA_C from "./discrimination_tree/TTT_VPA_C";
import LStarC from "./observation_table/L_StarC";
import NLStarC from "./observation_table/NL_StarC";

export type LearnerType = "L*" | "NL*" | "TTT-DFA" | "TTT-VPA"
let algos: LearnerType[] = ["L*", "NL*", "TTT-DFA", "TTT-VPA"]
interface State {
  cnt: LearnerType, regex: string, pos: Map<LearnerType, number>, algoList: {
    "L*": JSX.Element;
    "NL*": JSX.Element;
    "TTT-DFA": JSX.Element;
    "TTT-VPA": JSX.Element;
  }
}
interface Prop { cnt: string }

let regex = "(a+b)*a(a+b)(a+b)"
export default class LearnerContainerC extends React.Component<Prop, State> {
  constructor(prop: Prop) {
    super(prop)

    let teacher = new TeacherAutomaton({
      automaton: (regex),
      type: "Regex"
    })

    let [fstElt, sndElt] = prop.cnt.split(URL_SEPARATOR) as [LearnerType, string, string[]]
    let positions = new Map(algos.map(e => [e, 0]))

    let algo = algos.includes(fstElt) ? fstElt : "L*"

    positions.set(algo, parseInt(sndElt) || 0)
    let algoList = {
      "L*": <LStarC pos={positions.get("L*")!}
        updatePosition={this.updatePosition.bind(this)} changeRegexContainer={this.changeRegex.bind(this)} name={"L*"} learner={new L_star(teacher)} />,
      "NL*": <NLStarC pos={positions.get("NL*")!} updatePosition={this.updatePosition.bind(this)} changeRegexContainer={this.changeRegex.bind(this)} name={"NL*"} learner={new NL_star(teacher)} />,
      "TTT-DFA": <TTT_DFA_C pos={positions.get("TTT-DFA")!} updatePosition={this.updatePosition.bind(this)} changeRegexContainer={this.changeRegex.bind(this)} name={"TTT-DFA"} learner={new TTT_DFA(teacher)} />,
      "TTT-VPA": <TTT_VPA_C pos={positions.get("TTT-VPA")!} updatePosition={this.updatePosition.bind(this)} changeRegexContainer={this.changeRegex.bind(this)} name={"TTT-VPA"} learner={new TTT_VPA(new TeacherVPA({ automaton: createVPA4() }))} />
    }
    this.state = {
      cnt: algo,
      regex,
      pos: positions,
      algoList: algoList
    }
  }

  changeRegex(regex: string) {
    this.setState({ regex })
  }

  setAlgo(algoName: string) {
    let algo: LearnerType = algos.includes(algoName as LearnerType) ? (algoName as LearnerType) : "L*"
    this.setState({ cnt: algo })
    setUrlFromPosition(algo, 1)
    this.updatePosition(algo, this.state.pos.get(algo)!, true)
  }

  updatePosition(learner: LearnerType, pos: number, force = false) {
    if (learner === this.state.cnt || force) {
      let map = this.state.pos
      map.set(learner, pos)
      this.setState({ pos: map })
      setUrlFromPosition(pos + "", 2)
    }
  }

  componentDidMount() {
    this.setAlgo(this.state.cnt)
  }

  render(): React.ReactElement {
    return < >
      <Tabs defaultActiveKey={this.state.cnt}
        className="mb-3 nav-fill"
        onSelect={e => this.setAlgo(e!)}
        transition={false}
      >
        {algos.map(name =>
          <Tab eventKey={name} title={name} key={name}>
            {this.state.algoList[name]}
          </Tab>)}
      </Tabs>
    </ >
  }
}