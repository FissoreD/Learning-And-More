import { Dispatch } from "@reduxjs/toolkit"
import DFA_NFA from "../../../lib/automaton/regular/DFA_NFA"
import { VPAList } from "../../../lib/__test__/VPAforTest"
import { setUrlFromPosition } from "../../globalFunctions"
import { URL_SEPARATOR } from "../../globalVars"
import { LearnerType, LearnerTypeList } from "../../pages/learning/LearnerPage"
import { AlgosNavBarType, StoreLearnerInterface } from "../storeTypes"

export const URL_LEARNER_TYPE_POS = 1
export const URL_LEARNER_REGEX_POS = 2
export const URL_LEARNER_STEP_POS = 3

export function setLearnerUrlFromStore(store: StoreLearnerInterface) {
  let learner = store.currentAlgo
  let regex = store.algos[learner]
  let pos = store.pos[learner]
  setUrlFromPosition(["Learning" as AlgosNavBarType, learner, regex, pos].join(URL_SEPARATOR), 0)
}

export const setLearnerType = (learner: LearnerType) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearner", learner })
  }
}

export const setLearnerPos = (learner: LearnerType, pos: number) => {
  return (dispatch: Dispatch) => {
    dispatch({ type: "setLearnerPos", learner, pos });
  }
}

export const setLearnerRegex = (learner: LearnerType, regex: string) => {
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
    if (currentAlgo === "TTT-VPA" && VPAList[Number(url[URL_LEARNER_REGEX_POS]) - 1] === undefined) {
      return false;
    }
    try { DFA_NFA.regexToAutomaton(url[URL_LEARNER_REGEX_POS]) }
    catch { return false; }
    return true
  }

  let returnFunctionWithUrlSet = () => {
    console.log(2);

    setLearnerUrlFromStore({ algos, currentAlgo, pos })
    return { currentAlgo, pos, algos }
  }

  // Every learner is associated to the value of zero
  let pos = Object.assign({}, ...LearnerTypeList.map(e => ({ [e]: 0 })));
  // Every learner has the regex "1+(0+10)*" except for the TTT-VPA algo which uses the first algo of the VPAList
  let algos = Object.assign({}, ...LearnerTypeList.map(e => ({ [e]: e === "TTT-VPA" ? "1" : "1+(0+10)*" })))

  let currentAlgo: LearnerType = "L*";
  let url = window.location.search.substring(1).split(URL_SEPARATOR);
  if (url[0] !== ("Learning" as AlgosNavBarType))
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
  state = structuredClone(state);
  switch (action.type) {
    case "setLearner":
      state.currentAlgo = action.learner;
      break;
    case "setLearnerAlgo":
      state.algos[action.learner] = action.regex;
      state.pos[action.learner] = 0;
      break;
    case "setLearnerPos":
      state.pos[action.learner] = action.pos;
      break;
    default: return state;
  }
  console.log(1);

  setLearnerUrlFromStore(state);
  return state;
}