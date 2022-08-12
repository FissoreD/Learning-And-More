import { combineReducers, configureStore, Dispatch } from "@reduxjs/toolkit";
import { setUrlFromPosition } from "../globalFunctions";
import { URL_SEPARATOR } from "../globalVars";
import { setLearnerUrlFromStore, updateLearner } from "./actions/learnerAction";
import { AlgosNavBarType, ALGO_NAVBAR_LIST } from "./storeTypes";


export const setCurrentPage = (currentPage: AlgosNavBarType) => {
  setUrlFromPosition(currentPage, 0)
  if (currentPage === "Learning") {
    setLearnerUrlFromStore(store.getState().learner)
  }
  return (dispatch: Dispatch) => {
    dispatch({ type: "setCurrentPage", currentPage })
  }
}

type ActionType = { type: "setCurrentPage", currentPage: AlgosNavBarType }

export const updateCurrentPage = (state: AlgosNavBarType | undefined, action: ActionType): AlgosNavBarType => {
  if (state === undefined) {
    let url = window.location.search.substring(1).split(URL_SEPARATOR)[0]
    if (ALGO_NAVBAR_LIST.includes(url as AlgosNavBarType)) {
      state = url as AlgosNavBarType
    } else {
      state = "Home"
    }
  }
  switch (action.type) {
    case "setCurrentPage":
      return action.currentPage
    default: return state
  }
}

export let store = configureStore({
  reducer: combineReducers({
    learner: updateLearner,
    currentPage: updateCurrentPage,
    // automaton: updateAutomaton
  })
})