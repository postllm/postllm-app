import { z } from "zod";
import { database as db } from "../common/database";
import { BaseModelSchema } from "./base";

export const name = "File";
export const type = "File";
export const canDuplicate = true;
export const canSync = false;

export const schema = BaseModelSchema.extend({
	name: z.string(),
	path: z.string(),
	workspaceId: z.string(),
	collectionId: z.string(),
});

export type IFile = z.infer<typeof schema>;

export function init() {
	return {};
}

export function create(patch: Partial<IFile> = {}) {
	return db.docCreate<IFile>(type, patch);
}

export async function update(patch: Partial<IFile> = {}) {
	const doc = await db.getWhere<IFile>(type, { _id: patch._id });
	if (!doc) return;

	db.docUpdate<IFile>(doc, patch);
}

export function findByWorkspaceId(_id: string) {
	// @ts-ignore
	return db.find<IFile[]>(type, { workspaceId: _id });
}

export function findByCollectionId(_id: string) {
	// @ts-ignore
	return db.find<IFile[]>(type, { collectionId: _id });
}

export function all() {
	return db.all<IFile>(type);
}

export function getById(_id: string) {
	return db.getWhere<IFile>(type, { _id });
}

export function remove(template: IFile) {
	return db.remove(template);
}

