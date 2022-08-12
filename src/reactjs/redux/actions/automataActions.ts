import DFA_NFA from "../../../lib/automaton/regular/DFA_NFA";
import { VPAList } from "../../../lib/__test__/VPAforTest";
import { FSM_Type, Operation, StoreAutomataInterface } from "../storeTypes";

type ActionType =
  { type: "setFsmType", fsm: FSM_Type } |
  { type: "setFSMOperation", op: Operation, isA1: boolean } |
  { type: "setFSMRegex", regex: string, isA1: boolean } |
  { type: "switchFSM", fsm: FSM_Type }

const setFSMType = (fsm: FSM_Type) => {
  return {
    type: "setFsmType", fsm
  }
}

const setFSMOperation = (fsm: FSM_Type, operation: Operation, isA1: boolean) => {
  return {
    type: "setFSMOperation", fsm, operation, isA1
  }
}

const setFSMRegex = (fsm: FSM_Type, regex: string, isA1: boolean) => {
  return {
    type: "setFSMRegex", fsm, regex, isA1
  }
}

const switchFSM = (fsm: FSM_Type) => {
  return {
    type: "switchFSM", fsm
  }
}

const baseLearner = (): StoreAutomataInterface => {
  let dfa1 = DFA_NFA.regexToAutomaton("(ab+b)*(bb+a)"),
    dfa2 = DFA_NFA.regexToAutomaton("(a+b)b(aa+b)*"),
    vpa1 = VPAList[1], vpa2 = VPAList[2]
  return {
    currentType: "DFA",
    content: {
      DFA: {
        a1: dfa1,
        a2: dfa2,
        res: dfa1.union(dfa2),
        is_a1: true,
        lastOp: "\u222a"
      },
      VPA: {
        a1: vpa1,
        a2: vpa2,
        res: vpa1.union(vpa2),
        is_a1: true,
        lastOp: "\u222a"
      }
    }
  }
}

export const updateAutomaton = (state: StoreAutomataInterface = baseLearner(), action: ActionType): StoreAutomataInterface => {
  switch (action.type) {
    case "setFsmType":
      return { ...state, currentType: action.fsm }
    case "setFSMOperation":
      return { ...state, content: { ...state.content, [state.currentType]: { ...state.content[state.currentType], lastOp: action.op, isA1: action.isA1 } } }
    case "setFSMRegex":
      return {
        ...state, content: {
          ...state.content, [state.currentType]: {
            a1: action.isA1 ? action.regex : state.content[state.currentType].a1,
            a2: !action.isA1 ? action.regex : state.content[state.currentType].a2,
            lastOp: state.content[state.currentType].lastOp,
            is_a1: state.content[state.currentType].is_a1,
          }
        }
      }
    default: return state
  }
}

