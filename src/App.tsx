import React from 'react';
import { Container, Row } from "react-bootstrap";
import { connect } from 'react-redux';
import { ALGO_NAVBAR_LIST, ReactState } from './index';
import NavBar from './reactjs/components/NavBar';
import { logRender, removeFirstUrlPath, setUrlFromPosition } from './reactjs/globalFunctions';
import { URL_SEPARATOR } from './reactjs/globalVars';
import FSMPage from './reactjs/pages/automaton/FSMPage';
import HomePage from './reactjs/pages/HomePage';
import LearnerPage from './reactjs/pages/learning/LearnerPage';
import { AlgosNavBarType, StoreLearnerInterface } from './reactjs/redux/storeTypes';

class App extends React.Component<StoreLearnerInterface, ReactState> {
  constructor(prop: StoreLearnerInterface) {
    super(prop);
    this.state = this.giveContent();
    console.log(this.props, this.state);
  }

  giveContent(section?: AlgosNavBarType) {
    let urlCnt = "";
    if (section === undefined) {
      let [first, ...second] = removeFirstUrlPath().split(URL_SEPARATOR);
      urlCnt = second.join(URL_SEPARATOR);
      section = first as AlgosNavBarType;
    }
    let sectionNumber = Math.max(0, ALGO_NAVBAR_LIST.indexOf(section));
    return { sectionNumber, urlCnt };
  }

  swicthContent(section: string): void {
    let cnt = this.giveContent(section as AlgosNavBarType);
    if (cnt.sectionNumber !== this.state.sectionNumber) {
      setUrlFromPosition(ALGO_NAVBAR_LIST[cnt.sectionNumber], 0);
      this.setState(cnt);
    }
  }

  render(): React.ReactNode {
    logRender("Index");

    let dfaViewer = <FSMPage url={this.state.urlCnt} />;
    let learnerSection = <LearnerPage cnt={this.state.urlCnt} />;
    let home = <HomePage switchSection={this.swicthContent.bind(this)} />;

    let sectionList = [home, dfaViewer, learnerSection];

    return <>

      <NavBar changeCnt={this.swicthContent.bind(this)} />
      <p>{this.props.currentAlgo}</p>
      {/* <button onClick={() => this.props.increment()}>llll</button> */}
      <Container>
        <Row className="justify-content-center">
          <div className="col-xl-8 col-md-10">
            {sectionList[this.state.sectionNumber]}
          </div>
        </Row>
      </Container>
    </>;
  }
}

function mapStateToProps(state: StoreLearnerInterface): StoreLearnerInterface {
  return state
}


export default connect(mapStateToProps)(App)