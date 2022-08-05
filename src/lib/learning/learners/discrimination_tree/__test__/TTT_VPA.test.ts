import AlphabetVPA from "../../../../automaton/context_free/AlphabetVPA";
import StateVPA from "../../../../automaton/context_free/StateVPA";
import VPA from "../../../../automaton/context_free/VPA";
import { createVPA2, createVPAxml1, createVPAxml2 } from "../../../../__test__/VPAforTest";
import TeacherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

let autMaker = (): VPA => {
  // let xml = "<xml>", notXml = "</xml>", h1 = "<h1>", notH1 = "</h1>", text = "Text"
  let xml = "A", notXml = "D", h1 = "B", notH1 = "C", text = "T"
  let alphabet = new AlphabetVPA({ CALL: [xml], RET: [notXml], INT: [] })
  let stackAlphabet = ["a"]

  let state1 = new StateVPA({ name: "1", alphabet, stackAlphabet, isInitial: true })
  // let state2 = new StateVPA({ name: "2", alphabet, stackAlphabet })
  // let state3 = new StateVPA({ name: "3", alphabet, stackAlphabet })
  // let state4 = new StateVPA({ name: "4", alphabet, stackAlphabet })
  // let state5 = new StateVPA({ name: "5", alphabet, stackAlphabet })
  let state6 = new StateVPA({ name: "6", alphabet, stackAlphabet, isAccepting: true })

  state1.addTransition({ symbol: xml, successor: state1, topStack: stackAlphabet[0] })
  // state2.addTransition({ symbol: h1, successor: state4, topStack: stackAlphabet[1] })
  // state3.addTransition({ symbol: text, successor: state4 })
  // state4.addTransition({ symbol: notH1, successor: state5, topStack: stackAlphabet[1] })
  state1.addTransition({ symbol: notXml, successor: state6, topStack: stackAlphabet[0] })

  let vpa = new VPA([state1, state6])
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
    expect(learner.finish).toBeTruthy()
  })

  test("vpaXML2", () => {
    // let aut = autMaker().complete()

    // console.log(aut.toDot());
    // expect(aut.acceptWord("ABCD")).toBeTruthy()

    // expect(aut.isEmpty()).toBe(false);
    // console.log(aut.toDot());

    let automaton = createVPAxml2()
    let teacher = new TeacherVPA({ automaton })
    let learner = new TTT_VPA(teacher)

    console.log("-".repeat(30));
    // console.log("\n".repeat(5));


    let sym = learner.automaton!.symmetricDifference(automaton);

    // console.log(sym.toDot());

    // expect(sym.acceptWord("ABTCD"));
    expect(automaton.isEmpty()).toBeFalsy();
    expect(sym.isEmpty()).toBeFalsy();

    // console.log(learner.finish);


    for (let i = 0; i < 3; i++) {
      learner.makeNextQuery()
      console.log(`${learner.automaton?.toDot()}\n${learner.dataStructure.toDot()}`);
    }
  })
})

