import AlphabetVPA from "../../../../automaton/context_free/AlphabetVPA";
import StateVPA from "../../../../automaton/context_free/StateVPA";
import VPA from "../../../../automaton/context_free/VPA";
import { createVPA2, createVPAxml1, createVPAxml2 } from "../../../../__test__/VPAforTest";
import TeacherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

let autMaker = (): VPA => {
  // let xml = "<xml>", notXml = "</xml>", h1 = "<h1>", notH1 = "</h1>", text = "Text"
  let xml = "A", notXml = "D", h1 = "B", notH1 = "C", text = "T"
  let alphabet = new AlphabetVPA({ CALL: [xml, h1], RET: [notXml, notH1], INT: [text] })
  let stackAlphabet = ["0", "1"]

  let state1 = new StateVPA({ name: "1", alphabet, stackAlphabet, isInitial: true })
  let state2 = new StateVPA({ name: "2", alphabet, stackAlphabet })
  // let state3 = new StateVPA({ name: "3", alphabet, stackAlphabet })
  let state4 = new StateVPA({ name: "4", alphabet, stackAlphabet })
  let state5 = new StateVPA({ name: "5", alphabet, stackAlphabet })
  let state6 = new StateVPA({ name: "6", alphabet, stackAlphabet, isAccepting: true })

  state1.addTransition({ symbol: xml, successor: state2, topStack: "0" })
  state2.addTransition({ symbol: h1, successor: state4, topStack: "1" })
  // state1.addTransition({ symbol: text, successor: state4 })
  state4.addTransition({ symbol: notH1, successor: state5, topStack: "1" })
  state5.addTransition({ symbol: notXml, successor: state6, topStack: "1" })

  let vpa = new VPA([state1, state2, state4, state5, state6])
  return vpa
}

describe("TTT_VPA", () => {
  test("vpa2 := A ^ n II^ n B ^ n", () => {
    let teacher = new TeacherVPA({ automaton: createVPA2() })
    let learner = new TTT_VPA(teacher);
    learner.makeAllQueries()
    expect(learner.finish).toBeTruthy()
  })

  test("vpaXML1", () => {
    let automaton = createVPAxml1()
    let teacher = new TeacherVPA({ automaton })
    let learner = new TTT_VPA(teacher)
    learner.makeAllQueries()
    // for (let index = 0; index < 4; index++) {
    //   learner.makeNextQuery()
    // }
    expect(learner.finish).toBeTruthy()
  })

  test("vpaXML2", () => {
    let automaton = createVPAxml2()
    // console.log(automaton.toDot());

    let teacher = new TeacherVPA({ automaton })
    let learner = new TTT_VPA(teacher)

    learner.makeAllQueries()
    // for (let index = 0; index < 4; index++) {
    //   learner.makeNextQuery()
    // }
    expect(learner.finish).toBeTruthy();
  })

  // test("Test emptyness", () => {
  //   let aut = autMaker()
  //   console.log(aut.toDot());

  //   expect(aut.isEmpty()).toBeTruthy()
  // })
})

