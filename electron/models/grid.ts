import { z } from "zod";
import { database as db } from "../common/database";
import { BaseModelSchema } from "./base";
import * as llm from "./llm";

export const name = "Grid";
export const type = "Grid";
export const canDuplicate = true;
export const canSync = false;

const templateSchema = z.object({
	_id: z.string(),
	templateId: z.string(),
	versionId: z.string(),
});

const setSchema = z.object({
	_id: z.string(),
	name: z.string().optional(),
	variables: z.record(z.string(), z.any()),
	llm: llm.schema,
});

export const schema = BaseModelSchema.extend({
	name: z.string(),
	collectionId: z.string(),
	workspaceId: z.string(),
	templates: z.array(templateSchema).default([]),
	sets: z.array(setSchema).default([]),
	fileIds: z.array(z.string()).default([]),
	history: z
		.array(
			z.object({
				_id: z.string(),
				createdAt: z.number(),
				templates: z.array(templateSchema).default([]),
				sets: z.array(setSchema).default([]),
				results: z.record(z.string(), z.string()),
				fileIds: z.array(z.string()).default([]),
			}),
		)
		.default([]),
});

export type IGrid = z.infer<typeof schema>;

export function init() {
	return {};
}

export function create(patch: Partial<IGrid> = {}) {
	return db.docCreate<IGrid>(type, patch);
}

export async function update(
	patch: Partial<IGrid> = {},
): Promise<IGrid | null> {
	const doc = await db.getWhere<IGrid>(type, { _id: patch._id });
	if (!doc) return null;

	const data = await db.docUpdate<IGrid>(doc, patch);
	return (data.affectedDocuments as IGrid) ?? null;
}
export function all() {
	return db.all<IGrid>(type);
}

export function getById(_id: string) {
	return db.getWhere<IGrid>(type, { _id });
}

export function remove(grid: IGrid) {
	return db.remove(grid);
}

export function findByCollectionId(_id: string) {
	// @ts-ignore
	return db.find<IGrid[]>(type, { collectionId: _id });
}

