import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import React from 'react';
import { Container, Row } from "react-bootstrap";
import ReactDOM from 'react-dom/client';
import FSM_Viewer from './reactjs/automaton/FSM_Viewer';
import { NavBar } from './reactjs/components/NavBar';
import { removeFirstUrlPath, setFromPosition } from './reactjs/globalFunctions';
import { URL_SEPARATOR } from './reactjs/globalVars';
import "./reactjs/index.css";
import LearnerContainerC from './reactjs/learning/LearnerContainerC';
import Home from './reactjs/main';
import reportWebVitals from './reactjs/reportWebVitals';

interface ReactState { sectionNumber: number, urlCnt: string }
export type AlgosNavBarType = "Home" | "Automaton" | "Learning"
export const ALGO_NAVBAR_LIST: AlgosNavBarType[] = ["Home", "Automaton", "Learning"]


export class Main extends React.Component<{}, ReactState> {
  constructor(prop: {}) {
    super(prop)
    this.state = this.giveContent()
  }

  giveContent(section?: AlgosNavBarType) {
    let urlCnt = "";
    if (section === undefined) {
      let [first, ...second] = removeFirstUrlPath().split(URL_SEPARATOR)
      urlCnt = second.join(URL_SEPARATOR)
      section = first as AlgosNavBarType
    }
    let sectionNumber = Math.max(0, ALGO_NAVBAR_LIST.indexOf(section));
    return { sectionNumber, urlCnt };
  }

  swicthContent(section: AlgosNavBarType): void {
    let cnt = this.giveContent(section)
    if (cnt.sectionNumber != this.state.sectionNumber) {
      setFromPosition(ALGO_NAVBAR_LIST[cnt.sectionNumber], 0)
      this.setState(cnt)
    }
  }

  render(): React.ReactNode {
    let dfaViewer = <FSM_Viewer cnt={this.state.urlCnt} />
    let learnerSection = <LearnerContainerC cnt={this.state.urlCnt} />
    let home = <Home />

    let sectionList = [home, dfaViewer, learnerSection]

    return <>
      <NavBar changeCnt={this.swicthContent.bind(this)} />
      <Container >
        <Row className="justify-content-center" >
          <div className="col-xl-8 col-md-10">
            {sectionList[this.state.sectionNumber]}
          </div >
        </Row>
      </Container>
    </>
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// if (window) {
//   window.addEventListener('click', evt => {
//     let target = evt.target
//     if (target instanceof HTMLButtonElement || target instanceof HTMLLabelElement || target instanceof HTMLInputElement) {
//       target.blur()
//     }
//   })
// }