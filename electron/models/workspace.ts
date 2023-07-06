import { z } from "zod";
import { database as db } from "../common/database";
import { BaseModelSchema } from "./base";

export const name = "Workspace";
export const type = "Workspace";
export const canDuplicate = true;
export const canSync = false;

export const schema = BaseModelSchema.extend({
	name: z.string(),
});

export type IWorkspace = z.infer<typeof schema>;

const DEFAULT_WORKSPACE_ID = "1";

export function init() {
	return {};
}

export function create(patch: Partial<IWorkspace> = {}) {
	return db.docCreate<IWorkspace>(type, patch);
}

export function all() {
	return db.all<IWorkspace>(type);
}

export function getById(_id: string) {
	return db.getWhere<IWorkspace>(type, { _id });
}

export async function seed() {
	const defaultWorkspace = await getById(DEFAULT_WORKSPACE_ID);
	if (!defaultWorkspace) {
		try {
			await create({
				_id: DEFAULT_WORKSPACE_ID,
				name: "Main Workspace",
			});
		} catch (err) {}
	}
}

