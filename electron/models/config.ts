import { nanoid } from "nanoid";
import { z } from "zod";
import { database as db } from "../common/database";
import { BaseModelSchema } from "./base";

export const name = "Config";
export const type = "Config";
export const canDuplicate = false;
export const canSync = false;

export const schema = BaseModelSchema.extend({
	userId: z.string(),
	email: z.string().optional(),
	licenseKey: z.string().optional(),
	licenseValid: z.boolean().default(false),
	apiKeys: z.object({
		openAIKey: z.string().optional(),
	}),
});

export type IConfig = z.infer<typeof schema>;

const DEFAULT_CONFIG_ID = "1";

export function init() {
	return {};
}

export function create(patch: Partial<IConfig> = {}) {
	return db.docCreate<IConfig>(type, patch);
}

export async function update(patch: Partial<IConfig> = {}) {
	const doc = await db.getWhere<IConfig>(type, { _id: patch._id });
	if (!doc) return;

	db.docUpdate<IConfig>(doc, patch);
}

export function get() {
	return db.getWhere<IConfig>(type, { _id: DEFAULT_CONFIG_ID });
}

export async function seeded() {
	const defaultConfig = await get();
	return !!defaultConfig;
}

export async function seed() {
	const defaultConfig = await get();
	if (!defaultConfig) {
		try {
			await create({
				_id: DEFAULT_CONFIG_ID,
				userId: nanoid(),
			});
		} catch (err) {}
	}
}

