import AlphabetVPA from "../../../../automaton/context_free/AlphabetVPA";
import StateVPA from "../../../../automaton/context_free/StateVPA";
import VPA from "../../../../automaton/context_free/VPA";
import { createVPA3 } from "../../../../__test__/VPAforTest";
import TecherVPA from "../../../teachers/TeacherVPA";
import TTT_VPA from "../TTT_VPA";

let autNotEmpty = () => {
  let alphabet = new AlphabetVPA({ CALL: ["A"], RET: ["B"], INT: ["I"] })
  let a = "(ε,A)0", b = "(I,A)0"
  let stackAlphabet = [a, b]
  let stateE2 = new StateVPA({ name: "ε2", alphabet, stackAlphabet, isInitial: true })
  let stateEBot = new StateVPA({ name: "ε⊥", alphabet, stackAlphabet })
  let stateIBot = new StateVPA({ name: "I⊥", alphabet, stackAlphabet, isAccepting: false })
  stateE2.addTransition({ symbol: "A", successor: stateE2, topStack: a })
  stateE2.addTransition({ symbol: "B", successor: stateEBot, topStack: a })
  stateE2.addTransition({ symbol: "B", successor: stateEBot, topStack: b })

  stateEBot.addTransition({ symbol: "A", successor: stateEBot, topStack: a })
  stateEBot.addTransition({ symbol: "B", successor: stateEBot, topStack: b })
  stateEBot.addTransition({ symbol: "B", successor: stateEBot, topStack: a })
  stateEBot.addTransition({ symbol: "I", successor: stateIBot })

  stateIBot.addTransition({ symbol: "B", topStack: a, successor: stateIBot })

  return new VPA([stateE2, stateEBot, stateIBot])
}

test("TTT_VPA for G = A^n II^n B^n", () => {
  let teacher = new TecherVPA({ automaton: createVPA3() })
  let learner = new TTT_VPA(teacher);

  // console.log(teacher.automaton?.toDot());

  // console.log(teacher.automaton!.toGrammarar())


  // let res = learner.automaton!.symmetricDifference(teacher.automaton!).findWordAccepted(5)
  console.log(learner.automaton?.toDot());
  console.log(teacher.automaton?.toDot());

  learner.makeNextQuery()
  console.log(learner.lastCe);
  console.log(learner.automaton?.toDot());

  expect(learner.automaton.sameLanguage(teacher.automaton!)).toBe(false);

  throw new Error("Testing")

  // learner.makeAllQueries()
  // expect(learner.finish).toBeTruthy()
})

