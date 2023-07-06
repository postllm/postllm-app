import { z } from "zod";
import { collection } from "../../models";
import { procedure, router } from "../trpc";

const inputSchema = z.object({
	id: z.string(),
});

const allSchema = z.object({
	workspaceId: z.string(),
});

const upsertSchema = z.object({
	name: z.string(),
	id: z.string().optional(),
	workspaceId: z.string(),
});

export const collectionsRouter = router({
	all: procedure
		.input(allSchema)
		.output(collection.schema.array())
		// @ts-ignore
		.query(async ({ input, ctx }) => {
			const all = await collection.findByWorkspaceId(input.workspaceId);
			return all;
		}),
	get: procedure
		.input(inputSchema)
		.output(collection.schema.nullable())
		.query(async ({ input, ctx }) => {
			const col = await collection.getById(input.id);
			return col;
		}),
	create: procedure
		.input(upsertSchema)
		.output(collection.schema)
		.mutation(async ({ input, ctx }) => {
			const col = await collection.create(input);
			return col;
		}),
	update: procedure
		.input(upsertSchema)
		.output(collection.schema)
		// @ts-ignore
		.mutation(async ({ input, ctx }) => {
			const col = await collection.update(input);
			return col;
		}),
});

