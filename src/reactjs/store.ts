// import { configureStore, Dispatch } from "@reduxjs/toolkit";

// type t = { type: "increment" | "decrement" }

// export const increment = () => {
//   return (dispatch: Dispatch) => {
//     dispatch({ type: "increment" });
//   };
// }

// export const decrement = () => {
//   return ({ type: "decrement" })
// }

// type state = {
//   x: number,
//   y: number
// }

// export const counter = (state: state = { x: 5, y: 10 }, action: t) => {
//   switch (action.type) {
//     case "increment":
//       return { ...state, x: state.x + 1 }
//     case "decrement":
//       return { ...state, x: state.x - 1 }
//     default:
//       return state
//   }
// }

// export let store = configureStore({ reducer: counter })

// // store.subscribe(() => console.log(store.getState()))
// // store.dispatch(increment)


// function mapStateToProps(state: { x?: number, y?: number }) {
//   return {
//     x: state.x,
//     y: state.y
//   }
// }

// function z(dispatch: Function) {
//   return {
//     increment: () => dispatch(increment()),
//   }
// }

export { };
