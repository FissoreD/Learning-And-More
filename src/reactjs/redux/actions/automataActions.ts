import { Dispatch } from "@reduxjs/toolkit"
import FSM from "../../../lib/automaton/FSM.interface"
import { LearnerType } from "../../pages/learning/LearnerPage"
import { FSM_Type } from "../storeTypes"

export const setFSMAlgo = (learner: LearnerType, fsm: FSM, isA1: boolean) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: "setAlgo", learner, fsm, isA1 })
  }
}

export const setFSMType = (fsm: FSM_Type) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearning", fsm })
  }
}