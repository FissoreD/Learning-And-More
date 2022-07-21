// import dynamic from 'next/dynamic';
import React from "react";

// const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });
import Graphviz from "graphviz-react";
import { Col, Row } from "react-bootstrap";
import { StateVPA } from "../../lib/automaton/fsm/state_vpa";
import VPA from "../../lib/automaton/fsm/VPA";
import { FLEX_CENTER } from "../global_vars";

export let make_vpa = (): VPA => {
  let alphabet = { CALL: ["A"], RET: ["B", "C"], INT: ["I"] }
  let stack_alphabet = ["0"]
  let state1 = new StateVPA({ name: "1", isAccepting: true, alphabet, stackAlphabet: stack_alphabet })
  let state2 = new StateVPA({ name: "2", isInitial: true, alphabet, stackAlphabet: stack_alphabet })
  state1.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "I", successor: state1 })
  state2.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state1.addTransition({ symbol: "B", topStack: "0", successor: state1 })
  state2.addTransition({ symbol: "A", topStack: "0", successor: state2 })
  let vpa = new VPA([state1, state2])
  return vpa
}

let auts = [make_vpa(), make_vpa().complete(), make_vpa().union(make_vpa())]

const options = {
  fit: true,
  height: undefined,
  width: undefined,
  useWorker: false,
  zoom: false,
}


export default class TestVPAViewer extends React.Component<{}, {}>{

  render(): React.ReactElement {
    return <div className='text-center'>
      <pre>Alphabet: {JSON.stringify(make_vpa().alphabet)}</pre>
      <pre>Stack: {JSON.stringify(make_vpa().stackAlphabet)}</pre>
      <>
        {auts.map((e, pos) =>
          <React.Fragment key={pos}>
            <Row className="border">
              <Col sm={1} className={FLEX_CENTER}>{pos}</Col>
              <Col><Graphviz className='automaton img-fluid' options={options} dot={e.toDot()} /></Col>
            </Row>
          </React.Fragment>
        )}
      </>
    </div>
  }
}
