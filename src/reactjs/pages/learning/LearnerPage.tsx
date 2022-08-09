import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import TttDfa from "../../../lib/learning/learners/discrimination_tree/TttDfa";
import TttVpa from "../../../lib/learning/learners/discrimination_tree/TttVpa";
import LStar from "../../../lib/learning/learners/observation_table/LStar";
import NLStar from "../../../lib/learning/learners/observation_table/NLStar";
import TeacherDFA from "../../../lib/learning/teachers/TeacherDFA";
import TeacherVPA from "../../../lib/learning/teachers/TeacherVPA";
import { createVPAxml2 } from "../../../lib/__test__/VPAforTest";
import { logRender, setUrlFromPosition } from "../../globalFunctions";
import { URL_SEPARATOR } from "../../globalVars";
import TttDfaViewer from "./discrimination_tree/TttDfaViewer";
import TttVpaViewer from "./discrimination_tree/TttVpaViewer";
import LStarViewer from "./observation_table/LStarViewer";
import NLStarC from "./observation_table/NLStarViewer";

export type LearnerType = "L*" | "NL*" | "TTT-DFA" | "TTT-VPA"
let algos: string[] = ["L*", "NL*", "TTT-DFA", "TTT-VPA"]
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

export default class LearnerPage extends React.Component<Prop, State> {
  constructor(prop: Prop) {
    super(prop)

    let teacher = new TeacherDFA({
      automaton: (regex),
      type: "Regex"
    })

    let [fstElt, sndElt] = prop.cnt.split(URL_SEPARATOR) as [LearnerType, string, string[]]
    let positions = new Map(algos.map(e => [e as LearnerType, 0]))

    let algo = algos.includes(fstElt) ? fstElt : "L*"

    positions.set(algo, parseInt(sndElt) || 0)
    let algoList = {
      "L*": <LStarViewer pos={positions.get("L*")!}
        updatePosition={this.updatePosition.bind(this)} name={"L*"} learner={new LStar(teacher)} />,
      "NL*": <NLStarC pos={positions.get("NL*")!} updatePosition={this.updatePosition.bind(this)} name={"NL*"} learner={new NLStar(teacher)} />,
      "TTT-DFA": <TttDfaViewer pos={positions.get("TTT-DFA")!} updatePosition={this.updatePosition.bind(this)} name={"TTT-DFA"} learner={new TttDfa(teacher)} />,
      "TTT-VPA": <TttVpaViewer pos={positions.get("TTT-VPA")!} updatePosition={this.updatePosition.bind(this)} name={"TTT-VPA"} learner={new TttVpa(new TeacherVPA({ automaton: createVPAxml2() }))} />
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
    let algo = (algos.includes(algoName) ? algoName : "L*") as LearnerType
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

  shouldComponentUpdate(nextProps: Readonly<Prop>, nextState: Readonly<State>): boolean {
    return nextState.cnt !== this.state.cnt
  }

  render(): React.ReactElement {
    logRender("LearnerContainer")
    return < >
      <Tabs defaultActiveKey={this.state.cnt}
        className="mb-3 nav-fill"
        onSelect={e => this.setAlgo(e!)}
        transition={false}
      >
        {(algos as LearnerType[]).map(name =>
          <Tab eventKey={name} title={name} key={name}>
            {this.state.algoList[name]}
          </Tab>)}
      </Tabs>
    </ >
  }
}