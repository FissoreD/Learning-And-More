import { VPAList } from "../../../../__test__/VPAforTest";
import TeacherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

describe("TTT_VPA", () => {
  /** For every VPA the algorithm should terminate */
  test("VPA list in TTT-VPA", () => {
    VPAList.forEach(vpa => {
      let teacher = new TeacherVPA({ automaton: vpa })
      let learner = new TTT_VPA(teacher);
      learner.makeAllQueries()
      expect(learner.finish).toBeTruthy()
    })
  })
})

