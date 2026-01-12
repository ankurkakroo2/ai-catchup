"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils.ts
var utils_exports = {};
__export(utils_exports, {
  DEFAULT_ROWS: () => DEFAULT_ROWS,
  InkTerminalLoadingPlaceholder: () => InkTerminalLoadingPlaceholder,
  TERMINAL_BACKGROUND: () => TERMINAL_BACKGROUND,
  TERMINAL_LINE_HEIGHT: () => TERMINAL_LINE_HEIGHT,
  TERMINAL_PADDING: () => TERMINAL_PADDING,
  getTerminalHeight: () => getTerminalHeight,
  getTerminalPlaceholderStyle: () => getTerminalPlaceholderStyle,
  getTerminalPlaceholderStyleCentered: () => getTerminalPlaceholderStyleCentered
});
module.exports = __toCommonJS(utils_exports);

// src/InkTerminalLoadingPlaceholder.tsx
var import_react = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
var positionStyles = {
  "center": { alignItems: "center", justifyContent: "center" },
  "top-left": { alignItems: "flex-start", justifyContent: "flex-start", padding: "16px" },
  "top-right": { alignItems: "flex-start", justifyContent: "flex-end", padding: "16px" },
  "bottom-left": { alignItems: "flex-end", justifyContent: "flex-start", padding: "16px" },
  "bottom-right": { alignItems: "flex-end", justifyContent: "flex-end", padding: "16px" }
};
var InkTerminalLoadingPlaceholder = ({
  rows = 15,
  loading = "none",
  className = ""
}) => {
  const height = rows ? getTerminalHeight(rows) : void 0;
  let type = "spinner";
  let position = "center";
  let customElement = null;
  if (typeof loading === "string" && (loading === "spinner" || loading === "skeleton" || loading === "progress" || loading === "none")) {
    type = loading;
  } else if (loading && typeof loading === "object" && "type" in loading && !import_react.default.isValidElement(loading)) {
    const config = loading;
    type = config.type;
    position = config.position || "center";
  } else if (import_react.default.isValidElement(loading)) {
    customElement = loading;
  }
  const posStyle = positionStyles[position];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: `ink-terminal-box ${className}`,
      style: {
        height: height ? `${height}px` : void 0,
        position: "relative",
        background: "#000000"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        ...posStyle
      }, children: customElement || /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingIndicator, { type }) })
    }
  );
};
function LoadingIndicator({ type }) {
  switch (type) {
    case "spinner":
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {});
    case "skeleton":
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {});
    case "progress":
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {});
    case "none":
      return null;
    default:
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {});
  }
}
function Spinner() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: {
        color: "rgba(255, 255, 255, 0.5)",
        animation: "ink-spin 1s linear infinite"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
    }
  );
}
function Skeleton() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: "16px", width: "300px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", animation: "ink-pulse 2s ease-in-out infinite" } }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: "16px", width: "250px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", animation: "ink-pulse 2s ease-in-out infinite" } }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: "16px", width: "200px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", animation: "ink-pulse 2s ease-in-out infinite" } })
  ] });
}
function Progress() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
    width: "200px",
    height: "8px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "4px",
    overflow: "hidden"
  }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
    height: "100%",
    width: "100%",
    background: "rgba(255,255,255,0.8)",
    animation: "ink-progress-loop 1.5s ease-out infinite"
  } }) });
}

// src/utils.ts
var TERMINAL_LINE_HEIGHT = 18;
var TERMINAL_PADDING = 20;
var TERMINAL_BACKGROUND = "#000000";
var DEFAULT_ROWS = 15;
function getTerminalHeight(rows) {
  return rows * TERMINAL_LINE_HEIGHT + TERMINAL_PADDING;
}
function getTerminalPlaceholderStyle(rows = DEFAULT_ROWS) {
  return {
    height: getTerminalHeight(rows),
    background: TERMINAL_BACKGROUND
  };
}
function getTerminalPlaceholderStyleCentered(rows = DEFAULT_ROWS) {
  return {
    height: getTerminalHeight(rows),
    background: TERMINAL_BACKGROUND,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
}
//# sourceMappingURL=utils.cjs.map