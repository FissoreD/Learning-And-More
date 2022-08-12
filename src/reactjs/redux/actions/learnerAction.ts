import { Dispatch } from "@reduxjs/toolkit"
import DFA_NFA from "../../../lib/automaton/regular/DFA_NFA"
import { VPAList } from "../../../lib/__test__/VPAforTest"
import { setUrlFromPosition } from "../../globalFunctions"
import { URL_SEPARATOR } from "../../globalVars"
import { LearnerType, LearnerTypeList } from "../../pages/learning/LearnerPage"
import { store } from "../store"
import { AlgosNavBarType, ALGO_NAVBAR_LIST, StoreLearnerInterface } from "../storeTypes"

export const URL_LEARNER_TYPE_POS = 1
export const URL_LEARNER_REGEX_POS = 2
export const URL_LEARNER_STEP_POS = 3

export function setLearnerUrlFromStore(store: StoreLearnerInterface) {
  let learner = store.currentAlgo
  let regex = store.algos[learner]
  let pos = store.pos[learner]
  setUrlFromPosition([learner, regex, pos].join(URL_SEPARATOR), URL_LEARNER_TYPE_POS)
}

export const setLearnerType = (learner: LearnerType) => {
  let storeLearner = store.getState().learner;
  setLearnerUrlFromStore(store.getState().learner);
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearner", learner })
  }
}

export const setLearnerPos = (learner: LearnerType, pos: number) => {
  if (learner === store.getState().learner.currentAlgo)
    setUrlFromPosition(pos, URL_LEARNER_STEP_POS);
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearnerPos", learner, pos });
  }
}

export const setLearnerRegex = (learner: LearnerType, regex: string) => {
  setUrlFromPosition(`${regex}${URL_SEPARATOR}0`, URL_LEARNER_REGEX_POS);
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearnerAlgo", learner, regex })
  }
}

type ActionType =
  { type: "setLearner", learner: LearnerType } |
  { type: "setLearnerPos", learner: LearnerType, pos: number } |
  { type: "setLearnerAlgo", learner: LearnerType, regex: string }

const initiate = (): StoreLearnerInterface => {
  const isValidRegex = () => {
    if (currentAlgo === "TTT-VPA" && VPAList[Number(url[URL_LEARNER_REGEX_POS])] === undefined) {
      return false;
    }
    try { DFA_NFA.regexToAutomaton(url[URL_LEARNER_REGEX_POS]) }
    catch { return false; }
    return true
  }

  let returnFunctionWithUrlSet = () => {
    setLearnerUrlFromStore({ algos, currentAlgo, pos })
    return { currentAlgo, pos, algos }
  }

  // Every learner is associated to the value of zero
  let pos = Object.assign({}, ...LearnerTypeList.map(e => ({ [e]: 0 })));
  // Every learner has the regex "1+(0+10)*" except for the TTT-VPA algo which uses the first algo of the VPAList
  let algos = Object.assign({}, ...LearnerTypeList.map(e => ({ [e]: e === "TTT-VPA" ? "1" : "1+(0+10)*" })))

  let currentAlgo: LearnerType = "L*";
  let url = window.location.search.substring(1).split(URL_SEPARATOR);
  if (!ALGO_NAVBAR_LIST.includes(url[0] as AlgosNavBarType))
    return { currentAlgo, pos, algos }

  if (!LearnerTypeList.includes(url[URL_LEARNER_TYPE_POS] as LearnerType))
    return returnFunctionWithUrlSet()
  currentAlgo = url[URL_LEARNER_TYPE_POS] as LearnerType

  if (!url[URL_LEARNER_REGEX_POS] === undefined || !isValidRegex())
    return returnFunctionWithUrlSet()

  algos[currentAlgo] = url[URL_LEARNER_REGEX_POS]

  let posAlgo = Number(url[URL_LEARNER_STEP_POS])
  if (isNaN(posAlgo))
    return returnFunctionWithUrlSet()

  pos[currentAlgo] = posAlgo
  return returnFunctionWithUrlSet()
}

export const updateLearner = (state: StoreLearnerInterface = initiate(), action: ActionType): StoreLearnerInterface => {

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