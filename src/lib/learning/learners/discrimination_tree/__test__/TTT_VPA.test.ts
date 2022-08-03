import { createVPA2 } from "../../../../__test__/VPAforTest";
import TecherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

test("TTT_VPA for G = A^n II^n B^n", () => {
  let teacher = new TecherVPA({ automaton: createVPA2() })
  let learner = new TTT_VPA(teacher);

  for (let i = 0; i < 5; i++) {
    console.log(learner.dataStructure.toDot());
    console.log(learner.automaton.toDot());
    learner.makeNextQuery();
  }

  console.log(learner.finish);

  throw new Error("Testing")
})

