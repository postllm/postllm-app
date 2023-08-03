import { z } from "zod";
import { database as db } from "../common/database";
import { BaseModelSchema } from "./base";
import * as llm from "./llm";

export const name = "Chat";
export const type = "Chat";
export const canDuplicate = true;
export const canSync = false;

export const schema = BaseModelSchema.extend({
	collectionId: z.string(),
	workspaceId: z.string(),
	name: z.string(),
	settings: llm.schema,
	variables: z.record(z.string(), z.any()).optional(),
	messages: z.array(
		z.object({
			_id: z.string(),
			role: z.enum(["user", "system", "assistant"]).default("user"),
			prompt: z.string(),
			inputVariables: z.array(z.string()),
		}),
	),
});

export type IChat = z.infer<typeof schema>;

export function init() {
	return {};
}

export function create(patch: Partial<IChat> = {}) {
	return db.docCreate<IChat>(type, patch);
}

export async function update(
	patch: Partial<IChat> = {},
): Promise<IChat | null> {
	const doc = await db.getWhere<IChat>(type, { _id: patch._id });
	if (!doc) return null;

	const data = await db.docUpdate<IChat>(doc, patch);
	return (data.affectedDocuments as IChat) ?? null;
}

export function findByCollectionId(_id: string) {
	// @ts-ignore
	return db.find<IChat[]>(type, { collectionId: _id });
}

export function remove(template: IChat) {
	return db.remove(template);
}

export async function getById(_id: string): Promise<IChat | null> {
	// @ts-ignore
	const list = await db.findMostRecentlyModified<IChat[]>(type, {
		_id,
	});
	return (list?.[0] as unknown as IChat) ?? null;
}

