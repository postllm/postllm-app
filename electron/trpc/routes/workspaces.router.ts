import { z } from "zod";
import { workspace } from "../../models";
import { procedure, router } from "../trpc";

const getSchema = z.object({
	id: z.string(),
});

const createSchema = z.object({
	name: z.string(),
});

export const workspacesRouter = router({
	all: procedure
		.output(workspace.schema.array())
		.query(async ({ input, ctx }) => {
			return await workspace.all();
		}),
	get: procedure
		.input(getSchema)
		.output(workspace.schema.nullable())
		.query(async ({ input, ctx }) => {
			return await workspace.getById(input.id);
		}),
	create: procedure
		.input(createSchema)
		.output(workspace.schema)
		.mutation(async ({ input, ctx }) => {
			return await workspace.create(input);
		}),
});

