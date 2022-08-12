import React from 'react';
import { Container, Row } from "react-bootstrap";
import { connect } from 'react-redux';
import NavBar from './reactjs/components/NavBar';
import { logRender, removeFirstUrlPath } from './reactjs/globalFunctions';
import { URL_SEPARATOR } from './reactjs/globalVars';
import FSMPage from './reactjs/pages/automaton/FSMPage';
import HomePage from './reactjs/pages/HomePage';
import LearnerPage from './reactjs/pages/learning/LearnerPage';
import { AlgosNavBarType, ALGO_NAVBAR_LIST, StoreInterface } from './reactjs/redux/storeTypes';

export interface ReactState { urlCnt: string }

class App extends React.Component<{ cntAlgo: AlgosNavBarType }, ReactState> {
  constructor(prop: { cntAlgo: AlgosNavBarType }) {
    super(prop);
    this.state = this.giveContent();
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

  render(): React.ReactNode {
    logRender("App");

    let Automaton = <FSMPage url={this.state.urlCnt} />;
    let Learning = <LearnerPage />;
    let Home = <HomePage />;

    let sectionList: { [key in AlgosNavBarType]: JSX.Element } = { Home, Automaton, Learning };

    return <>
      <NavBar />
      <Container>
        <Row className="justify-content-center">
          <div className="col-xl-8 col-md-10">
            {sectionList[this.props.cntAlgo]}
          </div>
        </Row>
      </Container>
    </>;
  }
}

function mapStateToProps(state: StoreInterface): { cntAlgo: AlgosNavBarType } {
  return { cntAlgo: state.currentPage }
}


export default connect(mapStateToProps)(App)