import { createVPA2, createVPAxml1 } from "../../../../__test__/VPAforTest";
import TeacherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

describe("TTT_VPA", () => {
  test("vpa2 := A ^ n II^ n B ^ n", () => {
    let teacher = new TeacherVPA({ automaton: createVPA2() })
    let learner = new TTT_VPA(teacher);
    learner.makeAllQueries()
    expect(learner.finish).toBeTruthy()
  })

  test("vpaXML1 := <xml><h1>Text</h1></xml>", () => {
    let automaton = createVPAxml1()
    let teacher = new TeacherVPA({ automaton })
    let learner = new TTT_VPA(teacher)

    // console.log(learner.automaton?.symmetricDifference(teacher.automaton).toDot());
    // console.log(learner.automaton?.symmetricDifference(teacher.automaton).isEmpty());
    // expect(automaton.acceptWord("<h1>Text</h1>")).toBeTruthy()

    // expect(learner.automaton!.acceptWord("BT")).toBeTruthy()

    // console.log(`${0}\n${learner.dataStructure.toDot()}\n${learner.automaton!.toDot()}`);

    learner.makeAllQueries()

    expect(learner.finish).toBeTruthy()
  })
})

