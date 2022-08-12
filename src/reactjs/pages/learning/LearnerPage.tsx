import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { connect } from "react-redux";
import { logRender } from "../../globalFunctions";
import { setLearnerType } from "../../redux/actions/learnerAction";
import { StoreInterface, StoreLearnerInterface } from "../../redux/storeTypes";
import TttDfaViewer from "./discrimination_tree/TttDfaViewer";
import TttVpaViewer from "./discrimination_tree/TttVpaViewer";
import LStarViewer from "./observation_table/LStarViewer";
import NLStarC from "./observation_table/NLStarViewer";

export type LearnerType = "L*" | "NL*" | "TTT-DFA" | "TTT-VPA"
export const LearnerTypeList: LearnerType[] = ["L*", "NL*", "TTT-DFA", "TTT-VPA"]

interface State {
  "L*": JSX.Element;
  "NL*": JSX.Element;
  "TTT-DFA": JSX.Element;
  "TTT-VPA": JSX.Element;
}

interface Prop extends StoreLearnerInterface {
  setLearnerType(algo: LearnerType): void
}

export class LearnerPage extends React.Component<Prop, State> {
  constructor(prop: Prop) {
    super(prop)
    this.state = {
      "L*": <LStarViewer />,
      "NL*": <NLStarC />,
      "TTT-DFA": <TttDfaViewer />,
      "TTT-VPA": <TttVpaViewer />
    }
  }

  shouldComponentUpdate(nextProps: Readonly<Prop>, nextState: Readonly<State>) {
    return nextProps.currentAlgo !== this.props.currentAlgo
  }

  setAlgo(algoName: string) {
    let algo = (LearnerTypeList.includes(algoName as LearnerType) ? algoName : "L*") as LearnerType
    this.props.setLearnerType(algo)
  }

  render(): React.ReactElement {
    logRender("LearnerPage")
    return < >
      <Tabs defaultActiveKey={this.props.currentAlgo}
        className="mb-3 nav-fill"
        onSelect={e => this.setAlgo(e!)}
        transition={false}
      >
        {(LearnerTypeList as LearnerType[]).map(name =>
          <Tab eventKey={name} title={name} key={name}>
            {this.state[name]}
          </Tab>)}
      </Tabs>
    </ >
  }
}

function mapStateToProps(state: StoreInterface): StoreLearnerInterface {
  return state.learner
}

function mapDispatchToProps(dispatch: Function) {
  return {
    setLearnerType: (algo: LearnerType) => dispatch(setLearnerType(algo)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LearnerPage)