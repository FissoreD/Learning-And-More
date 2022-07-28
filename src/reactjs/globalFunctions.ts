import { URL_BASE, URL_SEPARATOR } from "./globalVars";

const intervalSlash = (...values: string[]) => values.reduce((prev, next) => `${prev}${URL_SEPARATOR}${next}`)

/** Modifies the current URL, with _no_ page realod */
export const changeUrl = (p?: { path: string, operation?: "Append" | "Root" | "ReplaceLast", position?: number }) => {
  let url: string;
  p = p || { operation: "Root", path: URL_BASE }
  p.operation = p.operation || "Root"
  switch (p.operation) {
    case "Append":
      url = intervalSlash(window.location.pathname, p.path!); break;
    case "ReplaceLast":
      if (!window.location.pathname.includes("/" + p.path + "/") && !window.location.pathname.endsWith(p.path))
        url = intervalSlash(window.location.pathname.match(/.*\/[^/]*\/[^/]*/)![0], p.path);
      else url = window.location.pathname;
      break;
    case "Root":
      url = "/" + p.path; break;
  }
  window.history.pushState("", "", url)
}

export const setUrl = (url: string) => {
  console.log(url);

  window.history.pushState("", "", "/" + URL_BASE + "/" + url)
}

export const withoutLastSeparator = (url: string) => {
  return url.substring(0, url.lastIndexOf(URL_SEPARATOR))
}