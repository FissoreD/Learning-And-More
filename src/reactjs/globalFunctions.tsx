import React from "react";
import { ButtonGroup } from "react-bootstrap";
import { URL_BASE } from "./globalVars";

export const removeFirstUrlPath = (): string => {
  return window.location.search.substring(1)
}

export const setUrlFromPosition = (tail: string, startPosition: number) => {
  let url = removeFirstUrlPath();
  if (url.endsWith(tail)) return;
  let urlPieces = url.split("&").filter(e => e !== "")
  window.history.pushState("", "",
    `/${URL_BASE}?` + (startPosition > 0 ? (urlPieces.splice(0, startPosition).join("&") + "&" + tail) : tail))
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

export const downloadSvg = (fileName: string) => {
  var svgBlob = new Blob([(document.getElementById(fileName)!.firstChild! as HTMLElement).outerHTML!], { type: "image/svg+xml;charset=utf-8" });
  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export const logRender = (className: string) => {
  console.log("Rendering", className)
}