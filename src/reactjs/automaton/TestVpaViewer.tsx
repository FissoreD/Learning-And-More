import React from "react";
import { Col, Row } from "react-bootstrap";
import AlphabetVPA from "../../lib/automaton/context_free/AlphabetVPA";
import StateVPA from "../../lib/automaton/context_free/StateVPA";
import VPA from "../../lib/automaton/context_free/VPA";
import GraphDotRender from "../components/GraphDotRender";
import { FLEX_CENTER } from "../globalVars";

let createVPA1 = (): VPA => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B", "C"], INT: ["I"] })
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

let createVPA2 = (): VPA => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B", "C"], INT: ["I"] })
  let stack_alphabet = ["2"]
  let state1 = new StateVPA({ name: "1", isAccepting: true, isInitial: true, alphabet, stackAlphabet: stack_alphabet })
  state1.addTransition({ symbol: "I", successor: state1 })
  state1.addTransition({ symbol: "A", topStack: "2", successor: state1 })
  state1.addTransition({ symbol: "B", topStack: "2", successor: state1 })
  let vpa = new VPA([state1])
  return vpa
}

let auts = [
  { desc: "VPA1", cnt: createVPA1() },
  { desc: "VPA1 compl", cnt: createVPA1().complete() },
  { desc: "VPA2", cnt: createVPA2() },
  { desc: "VPA2 compl", cnt: createVPA2().complete() },
  { desc: "VPA1 union VPA2", cnt: createVPA1().union(createVPA2()) },
  { desc: "VPA1 inter VPA2", cnt: createVPA1().intersection(createVPA2()) },
]

export default class TestVPAViewer extends React.Component<{}, {}>{

  render(): React.ReactElement {
    return <div className='text-center'>
      <>
        {auts.map((e, pos) =>
          <div key={pos} className="border">
            <Row className="justify-content-center">{"Description : " + e.desc}</Row>
            <Row>
              <Col sm={1} className={FLEX_CENTER}>{pos}</Col>
              <Col><GraphDotRender dot={e.cnt} /></Col>
            </Row>
          </div>
        )}
      </>
    </div>
  }
}
