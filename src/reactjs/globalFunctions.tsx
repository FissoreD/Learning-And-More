import React from "react";
import { ButtonGroup } from "react-bootstrap";
import { URL_BASE } from "./globalVars";

export const removeFirstUrlPath = (): string => {
  return window.location.pathname.substring(URL_BASE.length + 2)
}

export const setFromPosition = (tail: string, startPosition: number) => {
  let url = removeFirstUrlPath();
  if (url.endsWith(tail)) return;
  let urlPieces = url.split("&").filter(e => e !== "")
  window.history.pushState("", "",
    `/${URL_BASE}/` + (startPosition > 0 ? (urlPieces.splice(0, startPosition).join("&") + "&" + tail) : tail))
}

export const createButtonGroupAlgoSwitcher = (p: { labelList: string[], currentLabel: string, onclickOp: ((algo: string) => void) }) => {
  return <ButtonGroup vertical className={"position-sticky top-50 translate-middle-y"}>{p.labelList.map(
    (algo, pos) =>
      <React.Fragment key={pos}>
        <input type="radio" className="btn-check" name="btnradio" id={"btnradio" + pos} autoComplete="off" defaultChecked={algo === p.currentLabel} />
        <label className="btn btn-outline-secondary" htmlFor={"btnradio" + pos} onClick={() => p.onclickOp(algo)}>{algo}</label>
      </React.Fragment>)}
  </ButtonGroup>
}
