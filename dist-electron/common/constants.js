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
var stdin_exports = {};
__export(stdin_exports, {
  DB_PERSIST_INTERVAL: () => DB_PERSIST_INTERVAL,
  DEBOUNCE_MILLIS: () => DEBOUNCE_MILLIS,
  changelogUrl: () => changelogUrl,
  getAppEnvironment: () => getAppEnvironment,
  getAppId: () => getAppId,
  getAppPlatform: () => getAppPlatform,
  getAppVersion: () => getAppVersion,
  getProductName: () => getProductName,
  isDevelopment: () => isDevelopment,
  isLinux: () => isLinux,
  isMac: () => isMac,
  isWindows: () => isWindows
});
module.exports = __toCommonJS(stdin_exports);
var import_package = __toESM(require("../../package.json"));
const env = process["env"];
const getAppVersion = () => import_package.default.version;
const getProductName = () => import_package.default.name;
const getAppId = () => "com.postllm.app";
const getAppPlatform = () => process.platform;
const isMac = () => getAppPlatform() === "darwin";
const isLinux = () => getAppPlatform() === "linux";
const isWindows = () => getAppPlatform() === "win32";
const getAppEnvironment = () => process.env.INSOMNIA_ENV || "production";
const isDevelopment = () => getAppEnvironment() === "development";
const changelogUrl = () => "";
const DB_PERSIST_INTERVAL = 1e3 * 60 * 30;
const DEBOUNCE_MILLIS = 100;
