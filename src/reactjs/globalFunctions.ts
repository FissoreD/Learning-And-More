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

