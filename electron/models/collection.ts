import { z } from "zod";
import { database as db } from "../common/database";
import { BaseModelSchema } from "./base";

export const name = "Collection";
export const type = "Collection";
export const canDuplicate = true;
export const canSync = false;

export const schema = BaseModelSchema.extend({
	name: z.string(),
	workspaceId: z.string(),
});

export type ICollection = z.infer<typeof schema>;

const DEFAULT_COLLECTION_ID = "1";

export function init() {
	return {};
}

export function create(patch: Partial<ICollection> = {}) {
	return db.docCreate<ICollection>(type, patch);
}

export async function update(patch: Partial<ICollection> = {}) {
	const doc = await db.getWhere<ICollection>(type, { _id: patch._id });
	if (!doc) return;

	db.docUpdate<ICollection>(doc, patch);
}

export function findByWorkspaceId(_id: string) {
	// @ts-ignore
	return db.find<ICollection[]>(type, { workspaceId: _id });
}

export function all() {
	return db.all<ICollection>(type);
}

export function getById(_id: string) {
	return db.getWhere<ICollection>(type, { _id });
}

export function remove(template: ICollection) {
	return db.remove(template);
}

export async function seed() {
	const defaultCollection = await getById(DEFAULT_COLLECTION_ID);
	if (!defaultCollection) {
		try {
			await create({
				_id: DEFAULT_COLLECTION_ID,
				name: "PostLLM",
				workspaceId: "1",
			});
		} catch (err) {}
	}
}

