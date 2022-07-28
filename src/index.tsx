import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import React from 'react';
import { Container, Row } from "react-bootstrap";
import ReactDOM from 'react-dom/client';
import AutomatonContainerC from './reactjs/automaton/AutomatonContainerC';
import TestVPAViewer from './reactjs/automaton/TestVpaViewer';
import { NavBar } from './reactjs/components/NavBar';
import { removeFirstUrlPath } from './reactjs/globalFunctions';
import { URL_SEPARATOR } from './reactjs/globalVars';
import "./reactjs/index.css";
import LearnerContainerC, { LearnerAlgo } from './reactjs/learning/LearnerContainerC';
import Home from './reactjs/main';
import reportWebVitals from './reactjs/reportWebVitals';

interface Prop { cnt: React.ReactElement }
export type AlgosNavBar = "Home" | "Automaton" | "Learning" | "TestVPAViewer"


export class Main extends React.Component<{}, Prop> {
  constructor(prop: {}) {
    super(prop)
    // if (window.location.pathname === "/")
    //   setUrl("")
    this.state = { cnt: this.giveContent("" as AlgosNavBar) }
  }

  giveContent(section: AlgosNavBar) {
    let first = section, second = "";
    if (section === ("" as AlgosNavBar)) {
      let [first1, ...second1] = removeFirstUrlPath().split(URL_SEPARATOR)
      first = first1 as AlgosNavBar
      second = second1.join(URL_SEPARATOR)
    }
    let cnt: React.ReactElement;
    switch (first) {
      case "Automaton": cnt = <AutomatonContainerC />; break;
      case "Learning": cnt = <LearnerContainerC cnt={second as LearnerAlgo} />; break;
      case "TestVPAViewer": cnt = <TestVPAViewer />; break;
      default: cnt = <Home />
    }
    return cnt
  }

  swicthContent(section: AlgosNavBar): void {
    this.setState(() => { return { cnt: this.giveContent(section) } })
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