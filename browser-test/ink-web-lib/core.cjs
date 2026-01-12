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

// src/core.ts
var core_exports = {};
__export(core_exports, {
  DemoApp: () => DemoApp,
  InkTerminalBox: () => InkTerminalBox,
  InkTerminalLoadingPlaceholder: () => InkTerminalLoadingPlaceholder,
  InkXterm: () => InkXterm,
  mountInkInXterm: () => mountInkInXterm
});
module.exports = __toCommonJS(core_exports);

// src/InkXterm.tsx
var import_react = require("react");

// src/xterm-ink.tsx
var import_addon_fit = require("@xterm/addon-fit");
var import_ink = require("ink");
var import_xterm = require("xterm");

// src/shims/events.ts
var EventEmitter = class {
  constructor() {
    this.listenerMap = /* @__PURE__ */ new Map();
  }
  on(event, listener) {
    let set = this.listenerMap.get(event);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      this.listenerMap.set(event, set);
    }
    set.add(listener);
    return this;
  }
  addListener(event, listener) {
    return this.on(event, listener);
  }
  off(event, listener) {
    const set = this.listenerMap.get(event);
    if (set) set.delete(listener);
    return this;
  }
  removeListener(event, listener) {
    return this.off(event, listener);
  }
  once(event, listener) {
    const wrapped = (...args) => {
      this.off(event, wrapped);
      listener(...args);
    };
    return this.on(event, wrapped);
  }
  emit(event, ...args) {
    const set = this.listenerMap.get(event);
    if (!set || set.size === 0) return false;
    for (const listener of Array.from(set)) listener(...args);
    return true;
  }
  removeAllListeners(event) {
    if (typeof event === "string") {
      this.listenerMap.delete(event);
    } else {
      this.listenerMap.clear();
    }
    return this;
  }
};
var events_default = EventEmitter;

// src/shims/stream.ts
var Stream = class extends events_default {
};
var Writable = class extends Stream {
  constructor() {
    super(...arguments);
    this.writable = true;
  }
  write(chunk, _encoding, cb) {
    const data = typeof chunk === "string" ? chunk : String(chunk);
    this.emit("data", data);
    if (cb) cb();
    return true;
  }
  end() {
    this.emit("end");
  }
  cork() {
  }
  uncork() {
  }
  setDefaultEncoding(_enc) {
    return this;
  }
};
var Readable = class extends Stream {
  constructor() {
    super(...arguments);
    this.readable = true;
  }
  setEncoding(_enc) {
    return this;
  }
  resume() {
    return this;
  }
  pause() {
    return this;
  }
  pipe(_dest) {
    return _dest;
  }
  unpipe() {
    return this;
  }
};

// src/xterm-ink.tsx
var getYogaInit = () => {
  if (typeof globalThis !== "undefined" && globalThis.__yogaPromise) {
    return globalThis.__yogaPromise.then(() => void 0);
  }
  return Promise.resolve();
};
function mountInkInXterm(element, opts) {
  const containerWidth = opts.container.clientWidth;
  const containerHeight = opts.container.clientHeight;
  const charWidth = 9;
  const charHeight = 17;
  const initialCols = Math.floor(containerWidth / charWidth) || 80;
  const initialRows = Math.floor(containerHeight / charHeight) || 24;
  const term = new import_xterm.Terminal({
    convertEol: true,
    disableStdin: false,
    cols: initialCols,
    rows: initialRows,
    ...opts.termOptions
  });
  const fitAddon = new import_addon_fit.FitAddon();
  term.open(opts.container);
  term.loadAddon(fitAddon);
  if (opts.focus !== false) {
    setTimeout(() => {
      try {
        term.focus();
      } catch (e) {
        console.warn("Error focusing terminal:", e);
      }
    }, 100);
  }
  const stdoutBase = new Writable();
  stdoutBase.write = (chunk, encoding, cb) => {
    const str = typeof chunk === "string" ? chunk : String(chunk);
    term.write(str);
    if (typeof encoding === "function") {
      encoding();
    } else if (cb) {
      cb();
    }
    return true;
  };
  const stdout = Object.assign(stdoutBase, {
    columns: term.cols,
    rows: term.rows,
    isTTY: true,
    writable: true,
    setDefaultEncoding: (_enc) => stdout,
    cork: () => {
    },
    uncork: () => {
    }
  });
  const stdinBase = new Readable();
  const inputBuffer = [];
  const stdin = Object.assign(stdinBase, {
    columns: term.cols,
    rows: term.rows,
    isTTY: true,
    setEncoding: (_enc) => {
    },
    setRawMode: (_raw) => {
    },
    resume: () => {
    },
    pause: () => {
    },
    ref: () => {
    },
    unref: () => {
    },
    read: () => {
      return inputBuffer.length > 0 ? inputBuffer.shift() : null;
    }
  });
  term.onData((data) => {
    inputBuffer.push(data);
    stdin.emit("readable");
  });
  const updateStreamsSize = () => {
    const cols = term.cols;
    const rows = term.rows;
    stdout.columns = cols;
    stdout.rows = rows;
    stdin.columns = cols;
    stdin.rows = rows;
    stdout.emit("resize");
  };
  updateStreamsSize();
  let instance;
  getYogaInit().then(() => {
    instance = (0, import_ink.render)(element, {
      stdout,
      stderr: stdout,
      stdin,
      patchConsole: false
    });
  }).catch((e) => {
    console.error("Error initializing Yoga or rendering Ink:", e);
  });
  const resize = () => {
    try {
      if (term._core?.viewport) {
        fitAddon.fit();
        updateStreamsSize();
      }
    } catch (e) {
      console.error("Error during resize:", e);
    }
  };
  const ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(opts.container);
  const onWindowResize = () => resize();
  window.addEventListener("resize", onWindowResize);
  setTimeout(() => {
    resize();
    opts.onReady?.();
  }, 200);
  return {
    term,
    unmount: async () => {
      try {
        if (instance) {
          instance.unmount();
        }
      } finally {
        try {
          ro.disconnect();
        } catch {
        }
        window.removeEventListener("resize", onWindowResize);
        term.dispose();
      }
    }
  };
}

// src/InkXterm.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var InkXterm = ({ className = "", focus, termOptions, children, onReady }) => {
  const containerRef = (0, import_react.useRef)(null);
  const unmountRef = (0, import_react.useRef)(null);
  const initializedRef = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const initialize = () => {
      if (initializedRef.current || !container) return;
      if (container.clientWidth === 0 || container.clientHeight === 0) return;
      initializedRef.current = true;
      const { unmount } = mountInkInXterm(children, { container, focus, termOptions, onReady });
      unmountRef.current = unmount;
    };
    const rafId = requestAnimationFrame(() => {
      initialize();
      if (!initializedRef.current) {
        ro = new ResizeObserver(() => {
          initialize();
          if (initializedRef.current && ro) {
            ro.disconnect();
          }
        });
        ro.observe(container);
      }
    });
    let ro = null;
    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      initializedRef.current = false;
      if (unmountRef.current) {
        void unmountRef.current();
        unmountRef.current = null;
      }
    };
  }, [children, focus, termOptions, onReady]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className, ref: containerRef, style: { width: "100%", height: "100%" } });
};

// src/InkTerminalBox.tsx
var import_react3 = require("react");

// src/InkTerminalLoadingPlaceholder.tsx
var import_react2 = __toESM(require("react"), 1);
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  } else if (loading && typeof loading === "object" && "type" in loading && !import_react2.default.isValidElement(loading)) {
    const config = loading;
    type = config.type;
    position = config.position || "center";
  } else if (import_react2.default.isValidElement(loading)) {
    customElement = loading;
  }
  const posStyle = positionStyles[position];
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      className: `ink-terminal-box ${className}`,
      style: {
        height: height ? `${height}px` : void 0,
        position: "relative",
        background: "#000000"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        ...posStyle
      }, children: customElement || /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(LoadingIndicator, { type }) })
    }
  );
};
function LoadingIndicator({ type }) {
  switch (type) {
    case "spinner":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Spinner, {});
    case "skeleton":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Skeleton, {});
    case "progress":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Progress, {});
    case "none":
      return null;
    default:
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Spinner, {});
  }
}
function Spinner() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
    }
  );
}
function Skeleton() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { height: "16px", width: "300px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", animation: "ink-pulse 2s ease-in-out infinite" } }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { height: "16px", width: "250px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", animation: "ink-pulse 2s ease-in-out infinite" } }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { height: "16px", width: "200px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", animation: "ink-pulse 2s ease-in-out infinite" } })
  ] });
}
function Progress() {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: {
    width: "200px",
    height: "8px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "4px",
    overflow: "hidden"
  }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: {
    height: "100%",
    width: "100%",
    background: "rgba(255,255,255,0.8)",
    animation: "ink-progress-loop 1.5s ease-out infinite"
  } }) });
}

// src/utils.ts
var TERMINAL_LINE_HEIGHT = 18;
var TERMINAL_PADDING = 20;
function getTerminalHeight(rows) {
  return rows * TERMINAL_LINE_HEIGHT + TERMINAL_PADDING;
}

// src/InkTerminalBox.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var InkTerminalBox = ({ className = "", focus, termOptions, children, rows = 15, onReady, loading, padding = 10 }) => {
  const showLoading = loading !== false;
  const [ready, setReady] = (0, import_react3.useState)(!showLoading);
  const handleReady = (0, import_react3.useCallback)(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);
  const height = rows ? getTerminalHeight(rows) : void 0;
  const mergedTermOptions = rows ? { ...termOptions, rows } : termOptions;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: `ink-terminal-box ${className}`,
      style: height ? { height: `${height}px`, position: "relative", padding: `${padding}px` } : { position: "relative", padding: `${padding}px` },
      children: [
        showLoading && !ready && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InkTerminalLoadingPlaceholder, { rows, loading: loading || void 0, className }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: "ink-terminal-reset",
            style: showLoading ? { visibility: ready ? "visible" : "hidden", top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px` } : { top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px` },
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(InkXterm, { focus, termOptions: mergedTermOptions, onReady: handleReady, children })
          }
        )
      ]
    }
  );
};

// src/DemoApp.tsx
var import_ink2 = require("ink");
var import_react4 = __toESM(require("react"), 1);
var import_jsx_runtime4 = require("react/jsx-runtime");
var DemoApp = () => {
  const [input, setInput] = (0, import_react4.useState)("");
  const [history, setHistory] = (0, import_react4.useState)([]);
  (0, import_ink2.useInput)((inputChar, key) => {
    if (key.return) {
      if (input.trim()) {
        setHistory((prev) => [...prev, input]);
        setInput("");
      }
    } else if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
    } else if (!key.ctrl && !key.meta && inputChar) {
      setInput((prev) => prev + inputChar);
    }
  });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ink2.Box, { flexDirection: "column", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ink2.Text, { color: "green", children: "Ink + Xterm (browser)" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ink2.Text, { dimColor: true, children: [
      "React version: ",
      import_react4.default.version
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ink2.Text, { dimColor: true, children: "Type something and press Enter..." }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ink2.Text, { children: " " }),
    history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ink2.Box, { flexDirection: "column", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ink2.Text, { bold: true, children: "History:" }),
      history.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ink2.Text, { children: [
        " ",
        item
      ] }, i)),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ink2.Text, { children: " " })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_ink2.Text, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ink2.Text, { color: "cyan", children: "> " }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ink2.Text, { children: input }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_ink2.Text, { inverse: true, children: " " })
    ] })
  ] });
};
//# sourceMappingURL=core.cjs.map