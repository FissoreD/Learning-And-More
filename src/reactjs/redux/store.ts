import { configureStore } from "@reduxjs/toolkit";
import { updateLearner } from "./actions/learnerAction";


export let store = configureStore({
  reducer: updateLearner
})


// store.dispatch(initiate())

// store.subscribe(() => console.log(store.getState()))
// setLearnerType("L*")