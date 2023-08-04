var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
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
  all: () => all,
  chat: () => chat,
  collection: () => collection,
  config: () => config,
  file: () => file,
  getModel: () => getModel,
  grid: () => grid,
  initModel: () => initModel,
  llm: () => llm,
  promptTemplate: () => promptTemplate,
  types: () => types,
  workspace: () => workspace
});
module.exports = __toCommonJS(stdin_exports);
var import_nanoid = require("nanoid");
var _chat = __toESM(require("./chat"));
var _collection = __toESM(require("./collection"));
var _config = __toESM(require("./config"));
var _file = __toESM(require("./file"));
var _grid = __toESM(require("./grid"));
var _llm = __toESM(require("./llm"));
var _promptTemplate = __toESM(require("./prompt-template"));
var _workspace = __toESM(require("./workspace"));
const promptTemplate = _promptTemplate;
const collection = _collection;
const workspace = _workspace;
const config = _config;
const grid = _grid;
const llm = _llm;
<<<<<<< HEAD
const chat = _chat;
=======
const file = _file;
>>>>>>> main
function all() {
  return [
    _promptTemplate,
    _collection,
    _workspace,
    _config,
    _grid,
    _llm,
<<<<<<< HEAD
    _chat
=======
    _file
>>>>>>> main
  ];
}
function types() {
  return all().map((model) => model.type);
}
function getModel(type) {
  return all().find((m) => m.type === type) || null;
}
async function initModel(type, ...sources) {
  const model = getModel(type);
  if (!model) {
    const choices = all().map((m) => m.type).join(", ");
    throw new Error(
      `Tried to init invalid model "${type}". Choices are ${choices}`
    );
  }
  const objectDefaults = Object.assign(
    {},
    {
      _id: null,
      type,
      modifiedAt: Date.now(),
      createdAt: Date.now()
    },
    model.init()
  );
  const fullObject = Object.assign({}, objectDefaults, ...sources);
  if (!fullObject._id) {
    fullObject._id = (0, import_nanoid.nanoid)();
  }
  return fullObject;
}
