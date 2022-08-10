import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { logRender, setUrlFromPosition } from "../../globalFunctions";
import FSMViewer from "./FSMViewer";

type FSM_Type = 'VPA' | 'DFA'
const FSM_LIST: FSM_Type[] = ['DFA', 'VPA']

interface ReactProp { url: string }
interface ReactState {
  current: FSM_Type, FSM: {
    DFA: JSX.Element;
    VPA: JSX.Element;
  }
}

export default class FSMPage extends React.Component<ReactProp, ReactState>{
  constructor(prop: ReactProp) {
    super(prop)
    let FSM = {
      "DFA": <FSMViewer cnt="DFA" />,
      "VPA": <FSMViewer cnt="VPA" />
    }
    this.state = {
      current: (FSM_LIST.includes(prop.url as FSM_Type) ? prop.url : "DFA") as FSM_Type,
      FSM
    }
  }

  setAlgo(algoName: string) {
    let algo: FSM_Type = FSM_LIST.includes(algoName as FSM_Type) ? (algoName as FSM_Type) : "DFA"
    this.setState({ current: algo })
    setUrlFromPosition(algo, 1)
  }

  componentDidMount() {
    this.setAlgo(this.state.current)
  }

  render(): React.ReactNode {
    logRender("FSMContainer")

    return <Tabs defaultActiveKey={this.state.current}
      className="mb-3 nav-fill"
      onSelect={e => this.setAlgo(e!)}
      transition={false}
    >
      {FSM_LIST.map(name =>
        <Tab eventKey={name} title={name} key={name}>
          {this.state.FSM[name]}
        </Tab>)}
    </Tabs>
  }
}
