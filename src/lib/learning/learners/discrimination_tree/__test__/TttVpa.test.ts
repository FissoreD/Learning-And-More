import { VPAList } from "../../../../__test__/VPAforTest";
import TeacherVPA from "../../../teachers/TeacherVPA";
import TttVpa from "../TttVpa";

describe("TttVpa", () => {
  /** For every VPA the algorithm should terminate */
  test("VPA list in TttVpa", () => {
    VPAList.forEach(vpa => {
      let teacher = new TeacherVPA({ automaton: vpa })
      let learner = new TttVpa(teacher);
      learner.makeAllQueries()
      expect(learner.finish).toBeTruthy()
    })
  })
})

