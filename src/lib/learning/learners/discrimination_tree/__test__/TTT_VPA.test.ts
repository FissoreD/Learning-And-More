import { createVPA1 } from "../../../../automaton/context_free/__test__/VPA.test";
import TecherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

test("TTT_VPA for G = A^n II^n B^n", () => {
  let teacher = new TecherVPA({ automaton: createVPA1() })
  teacher.alphabet.RET.splice(teacher.alphabet.RET.indexOf("C"))
  let learner = new TTT_VPA(teacher);

  let res = learner.automaton!.symmetricDifference(teacher.automaton!).findWordAccepted(5)
  console.log("HERE", res)

  // throw new Error("Testing")

  // expect(learner.dataStructure.sift("aaa", t)?.name).toBe("")
  // expect(learner.dataStructure.sift("aab", t)?.name).toBe("")
  // expect(learner.dataStructure.sift("bba", t)?.name).toBe("")
  // expect(learner.dataStructure.sift("bb", t)?.name).toBe("a")
  // expect(learner.dataStructure.sift("a", t)?.name).toBe("a")

  // expect(learner.makeAutomaton().acceptWord("a")).toBeTruthy()
  // expect(learner.makeAutomaton().acceptWord("bb")).toBeFalsy()

  // learner.makeAllQueries()
  // expect(learner.finish).toBeTruthy()
})

