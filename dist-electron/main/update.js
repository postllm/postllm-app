var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  update: () => update
});
module.exports = __toCommonJS(stdin_exports);
var import_electron = require("electron");
var import_electron_updater = require("electron-updater");
function update(win) {
  import_electron_updater.autoUpdater.autoDownload = false;
  import_electron_updater.autoUpdater.disableWebInstaller = false;
  import_electron_updater.autoUpdater.allowDowngrade = false;
  import_electron_updater.autoUpdater.on("checking-for-update", function() {
  });
  import_electron_updater.autoUpdater.on("update-available", (arg) => {
    win.webContents.send("update-can-available", {
      update: true,
      version: import_electron.app.getVersion(),
      newVersion: arg == null ? void 0 : arg.version
    });
  });
  import_electron_updater.autoUpdater.on("update-not-available", (arg) => {
    win.webContents.send("update-can-available", {
      update: false,
      version: import_electron.app.getVersion(),
      newVersion: arg == null ? void 0 : arg.version
    });
  });
  import_electron.ipcMain.handle("check-update", async () => {
    if (!import_electron.app.isPackaged) {
      const error = new Error(
        "The update feature is only available after the package."
      );
      return { message: error.message, error };
    }
    try {
      return await import_electron_updater.autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      return { message: "Network error", error };
    }
  });
  import_electron.ipcMain.handle("start-download", (event) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          event.sender.send("update-error", {
            message: error.message,
            error
          });
        } else {
          event.sender.send("download-progress", progressInfo);
        }
      },
      () => {
        event.sender.send("update-downloaded");
      }
    );
  });
  import_electron.ipcMain.handle("quit-and-install", () => {
    import_electron_updater.autoUpdater.quitAndInstall(false, true);
  });
}
function startDownload(callback, complete) {
  import_electron_updater.autoUpdater.on("download-progress", (info) => callback(null, info));
  import_electron_updater.autoUpdater.on("error", (error) => callback(error, null));
  import_electron_updater.autoUpdater.on("update-downloaded", complete);
  import_electron_updater.autoUpdater.downloadUpdate();
}
