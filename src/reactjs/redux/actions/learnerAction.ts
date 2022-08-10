import { Dispatch } from "@reduxjs/toolkit"
import FSM from "../../../lib/automaton/FSM.interface"
import { setUrlFromPosition } from "../../globalFunctions"
import { LearnerType, LearnerTypeList } from "../../pages/learning/LearnerPage"
import { StoreLearnerInterface } from "../storeTypes"

export const setLearnerType = (learner: LearnerType) => {
  setUrlFromPosition(learner, 1)
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearner", learner })
  }
}

export const setLearnerPos = (learner: LearnerType, pos: number) => {
  setUrlFromPosition(pos + "", 2)
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearnerPos", learner, pos })
  }
}

export const setLearnerAlgo = (learner: LearnerType, fsm: FSM) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearnerAlgo", learner, fsm })
  }
}

type ActionType =
  { type: "setLearner", learner: LearnerType } |
  { type: "setLearnerPos", learner: LearnerType, pos: number } |
  { type: "setLearnerAlgo", learner: LearnerType, fsm: FSM }

export const baseLearner = (): StoreLearnerInterface => {
  let pos = Object.assign({}, ...LearnerTypeList.map(e => ({ [e]: 0 })));
  let algos: { [learnerType in LearnerType]: string } = Object.assign({}, ...LearnerTypeList.map(e => ({ [e]: e === "TTT-VPA" ? "1" : "1+(0+10)*" })))

  return { currentAlgo: "L*", pos, algos }
}

export const updateLearner = (state: StoreLearnerInterface = baseLearner(), action: ActionType): StoreLearnerInterface => {
  // let { algos, pos } = state;
  let { pos } = state
  switch (action.type) {
    case "setLearner":
      return { ...state, currentAlgo: action.learner }
    // case "setLearnerAlgo":
    //   algos[action.learner] = action.fsm
    //   return { ...state, algos }
    case "setLearnerPos":
      // pos[action.learner] = action.pos
      return { ...state, pos: { ...state.pos, [action.learner]: action.pos } }
    default: return state
  }
}