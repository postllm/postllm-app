import { nanoid } from "nanoid";
import { z } from "zod";
import { promptTemplate } from "../../models";
import { procedure, router } from "../trpc";

const inputSchema = z.object({
	id: z.string(),
});

const versionSchema = z.object({
	id: z.string(),
	versionId: z.string(),
});

const allSchema = z.object({
	collectionId: z.string(),
});

const upsertSchema = promptTemplate.schema;

export const templatesRouter = router({
	all: procedure
		.input(allSchema)
		.output(promptTemplate.schema.array())
		// @ts-ignore
		.query(async ({ input, ctx }) => {
			return promptTemplate.findByCollectionId(input.collectionId) ?? [];
		}),
	get: procedure
		.input(inputSchema)
		.output(promptTemplate.schema.nullable())
		.query(async ({ input, ctx }) => {
			const template = await promptTemplate.getById(input.id);
			return template;
		}),
	getVersion: procedure
		.input(versionSchema)
		.output(promptTemplate.templateVersionSchema.nullable())
		// @ts-ignore
		.query(async ({ input, ctx }) => {
			try {
				const template = await promptTemplate.getById(input.id);
				if (!template) return null;

				const version = (template?.versions ?? []).find(
					(v) => v._id === input.versionId,
				);
				return version;
			} catch (e) {
				return null;
			}
		}),
	create: procedure
		.input(upsertSchema)
		.output(promptTemplate.schema)
		.mutation(async ({ input, ctx }) => {
			const data = await promptTemplate.create(input);
			return data;
		}),
	update: procedure
		.input(upsertSchema)
		.output(promptTemplate.schema.nullable())
		.mutation(async ({ input, ctx }) => {
			console.log("update", input);
			const data = await promptTemplate.update({
				...input,
				modifiedAt: Date.now(),
			});
			return data;
		}),
	delete: procedure.input(inputSchema).mutation(async ({ input, ctx }) => {
		const template = await promptTemplate.getById(input.id);
		if (!template) return null;
		await promptTemplate.remove(template);
	}),
	clone: procedure.input(inputSchema).mutation(async ({ input, ctx }) => {
		const template = await promptTemplate.getById(input.id);
		if (!template) return null;

		const copy = structuredClone(template);
		copy._id = nanoid();
		copy.name = `(Copy) ${template.name}`;
		copy.createdAt = Date.now();
		copy.modifiedAt = Date.now();

		const versionCopy = structuredClone(template.versions[0]);
		versionCopy._id = nanoid();
		copy.versions = [versionCopy];

		await promptTemplate.create(copy);
	}),
});

