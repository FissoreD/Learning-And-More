import { combineReducers, configureStore, Dispatch } from "@reduxjs/toolkit";
import { updateLearner } from "./actions/learnerAction";
import { AlgosNavBarType } from "./storeTypes";


export const setCurrentPage = (currentPage: AlgosNavBarType) => {
  // setUrlFromPosition(currentPage, 1)
  return (dispatch: Dispatch) => {
    dispatch({ type: "setCurrentPage", currentPage })
  }
}

type ActionType = { type: "setCurrentPage", currentPage: AlgosNavBarType }

export const updateCurrentPage = (state: AlgosNavBarType = "Home", action: ActionType): AlgosNavBarType => {
  switch (action.type) {
    case "setCurrentPage":
      return action.currentPage
    default: return state
  }
}

export let store = configureStore({
  reducer: combineReducers({ learner: updateLearner, currentPage: updateCurrentPage })
})


// store.dispatch(initiate())

// store.subscribe(() => console.log(store.getState()))
// setLearnerType("L*")