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
  database: () => database,
  getDataDirectory: () => getDataDirectory
});
module.exports = __toCommonJS(stdin_exports);
var import_nedb = __toESM(require("@seald-io/nedb"));
var electron = __toESM(require("electron"));
var import_nanoid = require("nanoid");
var import_path = __toESM(require("path"));
var models = __toESM(require("../models/index"));
const database = {
  all: async function(type, options = {}) {
    return database.find(type) ?? [];
  },
  count: async function(type, query = {}, options = {}) {
    if (db._empty) {
      return _send("count", ...options);
    }
    return new Promise((resolve, reject) => {
      db[type].count(query, (err, count) => {
        if (err) {
          return reject(err);
        }
        resolve(count);
      });
    });
  },
  docCreate: async (type, patch) => {
    const doc = await models.initModel(
      type,
      patch,
      // Fields that the user can't touch
      {
        _id: patch._id ?? (0, import_nanoid.nanoid)(),
        type,
        modifiedAt: Date.now(),
        createdAt: Date.now()
      }
    );
    return database.insert(doc);
  },
  docUpdate: async (originalDoc, ...patches) => {
    const doc = await models.initModel(
      originalDoc.type,
      originalDoc,
      // NOTE: This is before `patches` because we want `patch.modified` to win if it has it
      {
        modifiedAt: Date.now()
      },
      ...patches
    );
    return database.update(doc);
  },
  find: async function(type, query = {}, sort = { modifiedAt: -1 }, options = []) {
    return new Promise((resolve, reject) => {
      db[type].find(query).sort(sort).exec(async (err, rawDocs) => {
        if (err) {
          reject(err);
          return;
        }
        const docs = [];
        for (const rawDoc of rawDocs) {
          docs.push(await models.initModel(type, rawDoc));
        }
        resolve(docs);
      });
    });
  },
  findMostRecentlyModified: async function(type, query = {}, limit = null) {
    if (db._empty) {
      return _send("findMostRecentlyModified", ...arguments);
    }
    return new Promise((resolve) => {
      db[type].find(query).sort({
        modifiedAt: -1
      }).limit(limit).exec(async (err, rawDocs) => {
        if (err) {
          console.warn("[db] Failed to find docs", err);
          resolve([]);
          return;
        }
        const docs = [];
        for (const rawDoc of rawDocs) {
          docs.push(await models.initModel(type, rawDoc));
        }
        resolve(docs);
      });
    });
  },
  get: async function(type, id) {
    if (db._empty) {
      return _send("get", ...arguments);
    }
    if (!id || id === "n/a") {
      return null;
    } else {
      return database.getWhere(type, { _id: id });
    }
  },
  getWhere: async function(type, query) {
    if (db._empty) {
      return _send("getWhere", ...arguments);
    }
    const docs = await database.find(type, query);
    return docs.length ? docs[0] : null;
  },
  init: async (types, config = {}, forceReset = false, consoleLog = console.log) => {
    if (forceReset) {
      for (const attr of Object.keys(db)) {
        if (attr === "_empty") {
          continue;
        }
        delete db[attr];
      }
    }
    for (const modelType of types) {
      if (db[modelType]) {
        consoleLog(`[db] Already initialized DB.${modelType}`);
        continue;
      }
      const filePath = getDBFilePath(modelType);
      const collection = new import_nedb.default(
        Object.assign(
          {
            autoload: true,
            filename: filePath
          },
          config
        )
      );
      db[modelType] = collection;
      collection.setAutocompactionInterval(1e3 * 10);
    }
    delete db._empty;
    if (!config.inMemoryOnly) {
      consoleLog(`[db] Initialized DB at ${getDBFilePath("$TYPE")}`);
    }
  },
  initClient: async () => {
    electron.ipcRenderer.on("db.changes", async (_e, changes) => {
    });
    console.log("[db] Initialized DB client");
  },
  insert: async function(doc, fromSync = false, initializeModel = true) {
    if (db._empty) {
      return _send("insert", ...arguments);
    }
    return new Promise(async (resolve, reject) => {
      let docWithDefaults = null;
      try {
        if (initializeModel) {
          docWithDefaults = await models.initModel(doc.type, doc);
        } else {
          docWithDefaults = doc;
        }
      } catch (err) {
        return reject(err);
      }
      db[doc.type].insert(
        // @ts-ignore
        docWithDefaults,
        (err, newDoc) => {
          if (err) {
            return reject(err);
          }
          resolve(newDoc);
        }
      );
    });
  },
  remove: async function(doc, fromSync = false) {
    return await db[doc.type].removeAsync(
      {
        _id: {
          $in: [doc._id]
        }
      },
      {
        multi: true
      }
    );
  },
  removeWhere: async function(type, query) {
    if (db._empty) {
      return _send("removeWhere", ...arguments);
    }
    for (const doc of await database.find(type, query)) {
      const docs = await database.withDescendants(doc);
      const docIds = docs.map((d) => d._id);
      const types = [...new Set(docs.map((d) => d.type))];
      types.map(
        (t) => db[t].remove(
          {
            _id: {
              $in: docIds
            }
          },
          {
            multi: true
          }
        )
      );
    }
  },
  /** Removes entries without removing their children */
  unsafeRemove: async function(doc, fromSync = false) {
    if (db._empty) {
      return _send("unsafeRemove", ...arguments);
    }
    db[doc.type].remove({ _id: doc._id });
  },
  update: async function(doc, fromSync = false) {
    return await db[doc.type].updateAsync({ _id: doc._id }, { ...doc, modifiedAt: Date.now() }, { upsert: true, returnUpdatedDocs: true });
  },
  withAncestors: async function(doc, types = allTypes()) {
    if (db._empty) {
      return _send("withAncestors", ...arguments);
    }
    if (!doc) {
      return [];
    }
    let docsToReturn = doc ? [doc] : [];
    async function next(docs) {
      const foundDocs = [];
      for (const d of docs) {
        for (const type of types) {
          const another = await database.get(type);
          another && foundDocs.push(another);
        }
      }
      if (foundDocs.length === 0) {
        return docsToReturn;
      }
      docsToReturn = [...docsToReturn, ...foundDocs];
      return next(foundDocs);
    }
    return next([doc]);
  },
  withDescendants: async function(doc, stopType = null, ...options) {
    if (db._empty) {
      return _send("withDescendants", ...options);
    }
    let docsToReturn = doc ? [doc] : [];
    async function next(docs) {
      let foundDocs = [];
      for (const doc2 of docs) {
        if (stopType && doc2 && doc2.type === stopType) {
          continue;
        }
        const promises = [];
        for (const type of allTypes()) {
          const parentId = doc2 ? doc2._id : null;
          const promise = database.find(type);
          promises.push(promise);
        }
        for (const more of await Promise.all(promises)) {
          foundDocs = [...foundDocs, ...more];
        }
      }
      if (foundDocs.length === 0) {
        return docsToReturn;
      }
      docsToReturn = [...docsToReturn, ...foundDocs];
      return next(foundDocs);
    }
    return next([doc]);
  }
};
const db = {};
const allTypes = () => Object.keys(db);
function getDBFilePath(modelType) {
  return import_path.default.join(getDataDirectory(), `postllm.${modelType}.db`);
}
function getDataDirectory() {
  const { app } = process.type === "renderer" ? window : electron;
  return process.env["INSOMNIA_DATA_PATH"] || app.getPath("userData");
}
async function _send(fnName, ...args) {
  return new Promise((resolve, reject) => {
    const replyChannel = `db.fn.reply:${(0, import_nanoid.nanoid)()}`;
    electron.ipcRenderer.send("db.fn", fnName, replyChannel, ...args);
    electron.ipcRenderer.once(replyChannel, (_e, err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
