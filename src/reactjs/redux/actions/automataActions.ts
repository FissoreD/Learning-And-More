// import { Dispatch } from "@reduxjs/toolkit";
// import { FSM_Type, Operation, StoreAutomataInterface } from "../storeTypes";

// type ActionType =
//   { type: "setFsmType", fsm: FSM_Type } |
//   { type: "setFSMOperation", op: Operation, isA1: boolean } |
//   { type: "setFSMRegex", regex: string, isA1: boolean } |
//   { type: "switchFSM", fsm: FSM_Type }

// const setFSMType = (fsm: FSM_Type) => {
//   return (dispatch: Dispatch) => {
//     dispatch({ type: "setFsmType", fsm })
//   }
// }

// const setFSMOperation = (fsm: FSM_Type, operation: Operation, isA1: boolean) => {
//   return (dispatch: Dispatch) => {
//     dispatch({ type: "setFSMOperation", fsm, operation, isA1 })
//   }
// }

// const setFSMRegex = (fsm: FSM_Type, regex: string, isA1: boolean) => {
//   return (dispatch: Dispatch) => {
//     dispatch({ type: "setFSMRegex", fsm, regex, isA1 })
//   }
// }

// const switchFSM = (fsm: FSM_Type) => {
//   return (dispatch: Dispatch) => {
//     dispatch({ type: "switchFSM", fsm })
//   }
// }

// const baseLearner = (): StoreAutomataInterface => {
//   return {
//     currentType: "DFA",
//     cnt: {
//       DFA: {
//         a1: "(ab+b)*(bb+a)",
//         a2: "(a+b)b(aa+b)*",
//         is_a1: true,
//         lastOp: "\u222a"
//       },
//       VPA: {
//         a1: "0",
//         a2: "1",
//         is_a1: true,
//         lastOp: "\u222a"
//       }
//     }
//   }
// }

// const updateAutomaton = (state: StoreAutomataInterface = baseLearner(), action: ActionType): StoreAutomataInterface => {
//   switch (action.type) {
//     case "setFsmType":
//       return { ...state, currentType: action.fsm }
//     case "setFSMOperation":
//       return { ...state, cnt: { ...state.cnt, [state.currentType]: { ...state.cnt[state.currentType], lastOp: action.op, isA1: action.isA1 } } }
//     case "setFSMRegex":
//       return {
//         ...state, cnt: {
//           ...state.cnt, [state.currentType]: {
//             a1: action.isA1 ? action.regex : state.cnt[state.currentType].a1,
//             a2: !action.isA1 ? action.regex : state.cnt[state.currentType].a2,
//             lastOp: state.cnt[state.currentType].lastOp,
//             is_a1: state.cnt[state.currentType].is_a1,
//           }
//         }
//       }
//     default: return state
//   }
// }

export { };
