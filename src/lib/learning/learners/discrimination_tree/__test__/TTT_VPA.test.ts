import { createVPA1 } from "../../../../automaton/context_free/__test__/vpa.test";
import TecherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

test("TTT_VPA for G = A^n II^n B^n", () => {
  let t = new TecherVPA({ automaton: createVPA1() })
  t.alphabet.RET.splice(t.alphabet.RET.indexOf("C"))
  let learner = new TTT_VPA(t);
  console.log(learner.automaton!.toDot());


  expect(learner.dataStructure.sift("aaa", t)?.name).toBe("")
  expect(learner.dataStructure.sift("aab", t)?.name).toBe("")
  expect(learner.dataStructure.sift("bba", t)?.name).toBe("")
  expect(learner.dataStructure.sift("bb", t)?.name).toBe("a")
  expect(learner.dataStructure.sift("a", t)?.name).toBe("a")

  expect(learner.makeAutomaton().acceptWord("a")).toBeTruthy()
  expect(learner.makeAutomaton().acceptWord("bb")).toBeFalsy()

  learner.makeAllQueries()
  expect(learner.finish).toBeTruthy()
})

