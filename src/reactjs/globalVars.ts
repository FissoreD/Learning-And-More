import { Engine, KeyMode } from "d3-graphviz";

export const FLEX_CENTER = "d-flex justify-content-center align-items-center"

export const GRAPHVIZ_OPTIONS = {
  height: undefined,
  width: undefined,
  scale: 1,
  tweenPrecision: 1,
  engine: 'dot' as Engine,
  keyMode: 'title' as KeyMode,
  convertEqualSidedPolygons: false,
  fade: false,
  growEnteringEdges: false,
  fit: true,
  tweenPaths: false,
  tweenShapes: false,
  useWorker: false,
  zoom: false,
};

export const URL_BASE = "Learning-And-More"

export const URL_SEPARATOR = "&"