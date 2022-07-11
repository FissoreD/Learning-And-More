import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import "./reactjs/index.css";

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Main } from "./reactjs/main";
import reportWebVitals from './reactjs/reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if (window) {
  window.addEventListener('click', evt => {
    let target = evt.target
    if (target instanceof HTMLButtonElement) {
      target.blur()
    }
  })
}