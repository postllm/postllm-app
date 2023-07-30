var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all2) => {
  for (var name2 in all2)
    __defProp(target, name2, { get: all2[name2], enumerable: true });
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
  all: () => all,
  canDuplicate: () => canDuplicate,
  canSync: () => canSync,
  create: () => create,
  findByWorkspaceId: () => findByWorkspaceId,
  getById: () => getById,
  init: () => init,
  name: () => name,
  remove: () => remove,
  schema: () => schema,
  seed: () => seed,
  type: () => type,
  update: () => update
});
module.exports = __toCommonJS(stdin_exports);
var import_zod = require("zod");
var import_database = require("../common/database");
var import_base = require("./base");
const name = "Collection";
const type = "Collection";
const canDuplicate = true;
const canSync = false;
const schema = import_base.BaseModelSchema.extend({
  name: import_zod.z.string(),
  workspaceId: import_zod.z.string()
});
const DEFAULT_COLLECTION_ID = "1";
function init() {
  return {};
}
function create(patch = {}) {
  return import_database.database.docCreate(type, patch);
}
async function update(patch = {}) {
  const doc = await import_database.database.getWhere(type, { _id: patch._id });
  if (!doc)
    return;
  import_database.database.docUpdate(doc, patch);
}
function findByWorkspaceId(_id) {
  return import_database.database.find(type, { workspaceId: _id });
}
function all() {
  return import_database.database.all(type);
}
function getById(_id) {
  return import_database.database.getWhere(type, { _id });
}
function remove(template) {
  return import_database.database.remove(template);
}
async function seed() {
  const defaultCollection = await getById(DEFAULT_COLLECTION_ID);
  if (!defaultCollection) {
    try {
      await create({
        _id: DEFAULT_COLLECTION_ID,
        name: "PostLLM",
        workspaceId: "1"
      });
    } catch (err) {
    }
  }
}
