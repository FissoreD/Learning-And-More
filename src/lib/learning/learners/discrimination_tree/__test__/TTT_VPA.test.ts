import { createVPA2, createVPAxml1, createVPAxml2, createVPAxml3 } from "../../../../__test__/VPAforTest";
import TeacherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

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

  test("vpaXML3", () => {
    let automaton = createVPAxml3();
    // console.log(automaton.toDot());
    expect(automaton.isEmpty()).toBeFalsy();

    let teacher = new TeacherVPA({ automaton })
    let learner = new TTT_VPA(teacher)

    // learner.makeAllQueries()
    for (let index = 0; index < 10; index++) {
      learner.makeNextQuery()
    }
    console.log(learner.dataStructure.toDot());
    console.log(learner.automaton?.toDot());


    expect(learner.finish).toBeTruthy();
  })
})

