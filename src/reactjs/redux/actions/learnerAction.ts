import { Dispatch } from "@reduxjs/toolkit"
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

export const setLearnerAlgo = (learner: LearnerType, regex: string) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearnerAlgo", learner, regex })
  }
}

type ActionType =
  { type: "setLearner", learner: LearnerType } |
  { type: "setLearnerPos", learner: LearnerType, pos: number } |
  { type: "setLearnerAlgo", learner: LearnerType, regex: string }

export const baseLearner = (): StoreLearnerInterface => {
  let pos = Object.assign({}, ...LearnerTypeList.map(e => ({ [e]: 0 })));
  let algos: { [learnerType in LearnerType]: string } = Object.assign({}, ...LearnerTypeList.map(e => ({ [e]: e === "TTT-VPA" ? "1" : "1+(0+10)*" })))

  return { currentAlgo: "L*", pos, algos }
}

export const updateLearner = (state: StoreLearnerInterface = baseLearner(), action: ActionType): StoreLearnerInterface => {
  // let { algos, pos } = state;
  let { pos, algos } = state
  switch (action.type) {
    case "setLearner":
      return { ...state, currentAlgo: action.learner }
    case "setLearnerAlgo":
      return { ...state, algos: { ...algos, [action.learner]: action.regex } }
    case "setLearnerPos":
      return { ...state, pos: { ...pos, [action.learner]: action.pos } }
    default: return state
  }
}