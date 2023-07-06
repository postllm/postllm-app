import NeDB from "@seald-io/nedb";
import * as electron from "electron";
import { IBaseModel } from "electron/models/base";
import { nanoid } from "nanoid";
import fsPath from "path";
import * as models from "../models/index";

export interface Query {
	[key: string]: any;
}

type Sort = Record<string, any>;
type Patch<T> = Partial<T>;

export const database = {
	all: async function <T extends IBaseModel>(
		type: string,
		options: any = {},
	): Promise<T[]> {
		return database.find<T>(type) ?? [];
	},

	count: async function <T extends IBaseModel>(
		type: string,
		query: Query = {},
		options: any = {},
	) {
		if (db._empty) {
			return _send<number>("count", ...options);
		}
		return new Promise<number>((resolve, reject) => {
			(db[type] as NeDB<T>).count(query, (err, count) => {
				if (err) {
					return reject(err);
				}

				resolve(count);
			});
		});
	},

	docCreate: async <T extends IBaseModel>(type: string, patch: Patch<T>) => {
		const doc = await models.initModel<T>(
			type,
			patch,
			// Fields that the user can't touch
			{
				_id: patch._id ?? nanoid(),
				type: type,
				modifiedAt: Date.now(),
				createdAt: Date.now(),
			},
		);
		return database.insert<T>(doc);
	},

	docUpdate: async <T extends IBaseModel>(
		originalDoc: T,
		...patches: Patch<T>[]
	) => {
		// No need to re-initialize the model during update; originalDoc will be in a valid state by virtue of loading
		const doc = await models.initModel<T>(
			originalDoc.type,
			originalDoc,

			// NOTE: This is before `patches` because we want `patch.modified` to win if it has it
			{
				modifiedAt: Date.now(),
			},
			...patches,
		);
		return database.update<T>(doc);
	},

	find: async function <T extends IBaseModel>(
		type: string,
		query: Query | string = {},
		sort: Sort = { modifiedAt: -1 },
		options: any[] = [],
	) {
		return new Promise<T[]>((resolve, reject) => {
			(db[type] as NeDB<T>)
				.find(query)
				.sort(sort)
				.exec(async (err, rawDocs) => {
					if (err) {
						reject(err);
						return;
					}

					const docs: T[] = [];

					for (const rawDoc of rawDocs) {
						docs.push(await models.initModel(type, rawDoc));
					}

					resolve(docs);
				});
		});
	},

	findMostRecentlyModified: async function <T extends IBaseModel>(
		type: string,
		query: Query = {},
		limit: number | null = null,
	) {
		if (db._empty) {
			return _send<T[]>("findMostRecentlyModified", ...arguments);
		}
		return new Promise<T[]>((resolve) => {
			(db[type] as NeDB<T>)
				.find(query)
				.sort({
					modifiedAt: -1,
				})
				// @ts-expect-error -- TSCONVERSION limit shouldn't be applied if it's null, or default to something that means no-limit
				.limit(limit)
				.exec(async (err, rawDocs) => {
					if (err) {
						console.warn("[db] Failed to find docs", err);
						resolve([]);
						return;
					}

					const docs: T[] = [];

					for (const rawDoc of rawDocs) {
						docs.push(await models.initModel(type, rawDoc));
					}

					resolve(docs);
				});
		});
	},

	get: async function <T extends IBaseModel>(type: string, id?: string) {
		if (db._empty) {
			return _send<T>("get", ...arguments);
		}

		// Short circuit IDs used to represent nothing
		if (!id || id === "n/a") {
			return null;
		} else {
			return database.getWhere<T>(type, { _id: id });
		}
	},

	getWhere: async function <T extends IBaseModel>(
		type: string,
		query: Query,
	) {
		if (db._empty) {
			return _send<T>("getWhere", ...arguments);
		}
		const docs = await database.find<T>(type, query);
		return docs.length ? docs[0] : null;
	},

	init: async (
		types: string[],
		config: NeDB.DataStoreOptions = {},
		forceReset = false,
		consoleLog: typeof console.log = console.log,
	) => {
		if (forceReset) {
			for (const attr of Object.keys(db)) {
				if (attr === "_empty") {
					continue;
				}

				delete db[attr];
			}
		}

		// Fill in the defaults
		for (const modelType of types) {
			if (db[modelType]) {
				consoleLog(`[db] Already initialized DB.${modelType}`);
				continue;
			}

			const filePath = getDBFilePath(modelType);
			const collection = new NeDB(
				Object.assign(
					{
						autoload: true,
						filename: filePath,
					},
					config,
				),
			);
			db[modelType] = collection;
			collection.setAutocompactionInterval(1000 * 10);
		}

		delete db._empty;

		if (!config.inMemoryOnly) {
			consoleLog(`[db] Initialized DB at ${getDBFilePath("$TYPE")}`);
		}
	},

	initClient: async () => {
		electron.ipcRenderer.on("db.changes", async (_e, changes) => {});
		console.log("[db] Initialized DB client");
	},

	insert: async function <T extends IBaseModel>(
		doc: T,
		fromSync = false,
		initializeModel = true,
	) {
		if (db._empty) {
			return _send<T>("insert", ...arguments);
		}
		return new Promise<T>(async (resolve, reject) => {
			let docWithDefaults: T | null = null;

			try {
				if (initializeModel) {
					docWithDefaults = await models.initModel<T>(doc.type, doc);
				} else {
					docWithDefaults = doc;
				}
			} catch (err) {
				return reject(err);
			}

			(db[doc.type] as NeDB<T>).insert(
				// @ts-ignore
				docWithDefaults,
				(err, newDoc: T) => {
					if (err) {
						return reject(err);
					}

					resolve(newDoc);
				},
			);
		});
	},

	remove: async function <T extends IBaseModel>(doc: T, fromSync = false) {
		return await db[doc.type].removeAsync(
			{
				_id: {
					$in: [doc._id],
				},
			},
			{
				multi: true,
			},
		);
	},

	removeWhere: async function <T extends IBaseModel>(
		type: string,
		query: Query,
	) {
		if (db._empty) {
			return _send<void>("removeWhere", ...arguments);
		}
		for (const doc of await database.find<T>(type, query)) {
			const docs = await database.withDescendants(doc);
			const docIds = docs.map((d) => d._id);
			const types = [...new Set(docs.map((d) => d.type))];

			// Don't really need to wait for this to be over;
			types.map((t) =>
				db[t].remove(
					{
						_id: {
							$in: docIds,
						},
					},
					{
						multi: true,
					},
				),
			);
		}
	},

	/** Removes entries without removing their children */
	unsafeRemove: async function <T extends IBaseModel>(
		doc: T,
		fromSync = false,
	) {
		if (db._empty) {
			return _send<void>("unsafeRemove", ...arguments);
		}

		(db[doc.type] as NeDB<T>).remove({ _id: doc._id });
	},

	update: async function <T extends IBaseModel>(doc: T, fromSync = false) {
		return await (db[doc.type] as NeDB<T>).updateAsync({_id: doc._id}, {...doc, modifiedAt: Date.now()}, {upsert: true, returnUpdatedDocs: true});
	},

	withAncestors: async function <T extends IBaseModel>(
		doc: T | null,
		types: string[] = allTypes(),
	) {
		if (db._empty) {
			return _send<T[]>("withAncestors", ...arguments);
		}

		if (!doc) {
			return [];
		}

		let docsToReturn: T[] = doc ? [doc] : [];

		async function next(docs: T[]): Promise<T[]> {
			const foundDocs: T[] = [];

			for (const d of docs) {
				for (const type of types) {
					// If the doc is null, we want to search for parentId === null
					const another = await database.get<T>(type);
					another && foundDocs.push(another);
				}
			}

			if (foundDocs.length === 0) {
				// Didn't find anything. We're done
				return docsToReturn;
			}

			// Continue searching for children
			docsToReturn = [...docsToReturn, ...foundDocs];
			return next(foundDocs);
		}

		return next([doc]);
	},

	withDescendants: async function <T extends IBaseModel>(
		doc: T | null,
		stopType: string | null = null,
		...options: any[]
	): Promise<IBaseModel[]> {
		if (db._empty) {
			return _send<IBaseModel[]>("withDescendants", ...options);
		}
		let docsToReturn: IBaseModel[] = doc ? [doc] : [];

		async function next(docs: (IBaseModel | null)[]): Promise<IBaseModel[]> {
			let foundDocs: IBaseModel[] = [];

			for (const doc of docs) {
				if (stopType && doc && doc.type === stopType) {
					continue;
				}

				const promises: Promise<IBaseModel[]>[] = [];

				for (const type of allTypes()) {
					// If the doc is null, we want to search for parentId === null
					const parentId = doc ? doc._id : null;
					const promise = database.find(type);
					promises.push(promise);
				}

				for (const more of await Promise.all(promises)) {
					foundDocs = [...foundDocs, ...more];
				}
			}

			if (foundDocs.length === 0) {
				// Didn't find anything. We're done
				return docsToReturn;
			}

			// Continue searching for children
			docsToReturn = [...docsToReturn, ...foundDocs];
			return next(foundDocs);
		}

		return next([doc]);
	},
};

interface DB {
	[index: string]: NeDB;
}

const db: DB = {};

// ~~~~~~~ //
// HELPERS //
// ~~~~~~~ //
const allTypes = () => Object.keys(db);

function getDBFilePath(modelType: string) {
	return fsPath.join(getDataDirectory(), `postllm.${modelType}.db`);
}

export function getDataDirectory() {
	// @ts-ignore
	const { app } = process.type === "renderer" ? window : electron;
	return process.env["INSOMNIA_DATA_PATH"] || app.getPath("userData");
}

// ~~~~~~~ //
async function _send<T>(fnName: string, ...args: any[]) {
	return new Promise<T>((resolve, reject) => {
		const replyChannel = `db.fn.reply:${nanoid()}`;
		electron.ipcRenderer.send("db.fn", fnName, replyChannel, ...args);
		electron.ipcRenderer.once(replyChannel, (_e, err, result: T) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

