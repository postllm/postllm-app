var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_electron = require("electron");
var import_main = require("electron-trpc/main");
var import_node_os = require("node:os");
var import_node_path = require("node:path");
var import_database = require("../common/database");
var models = __toESM(require("../models/index"));
var import_app = require("../trpc/_app");
var import_axiom = __toESM(require("../utils/axiom"));
var import_update = require("./update");
process.env.DIST_ELECTRON = (0, import_node_path.join)(__dirname, "../");
process.env.DIST = (0, import_node_path.join)(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL ? (0, import_node_path.join)(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
if ((0, import_node_os.release)().startsWith("6.1"))
  import_electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  import_electron.app.setAppUserModelId(import_electron.app.getName());
if (!import_electron.app.requestSingleInstanceLock()) {
  import_electron.app.quit();
  process.exit(0);
}
let win = null;
const preload = (0, import_node_path.join)(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = (0, import_node_path.join)(process.env.DIST, "index.html");
async function createWindow() {
  const { height, width } = import_electron.screen.getPrimaryDisplay().workAreaSize;
  win = new import_electron.BrowserWindow({
    title: "PostLLM",
    width,
    height,
    icon: (0, import_node_path.join)(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true
    }
  });
  if (url) {
    win.loadURL(url);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  await import_database.database.init(models.types());
  const seeded = await models.config.seeded();
  await models.config.seed();
  if (!seeded) {
    await models.workspace.seed();
    await models.collection.seed();
    await models.promptTemplate.seed();
  }
  (0, import_main.createIPCHandler)({ router: import_app.appRouter, windows: [win] });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
  });
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:"))
      import_electron.shell.openExternal(url2);
    return { action: "deny" };
  });
  (0, import_update.update)(win);
  (0, import_axiom.default)("app", { path: "start" });
}
import_electron.app.whenReady().then(createWindow);
import_electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin")
    import_electron.app.quit();
});
import_electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized())
      win.restore();
    win.focus();
  }
});
import_electron.app.on("activate", () => {
  const allWindows = import_electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
import_electron.ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new import_electron.BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
