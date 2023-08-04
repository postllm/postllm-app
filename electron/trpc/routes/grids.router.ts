/* eslint-disable array-callback-return */
import { nanoid } from "nanoid";
import { z } from "zod";
import { grid } from "../../models";
import { procedure, router } from "../trpc";

const allSchema = z.object({
	collectionId: z.string(),
});

const inputSchema = z.object({
	id: z.string(),
});

export const gridsRouter = router({
	all: procedure
		.input(allSchema)
		.output(grid.schema.array())
		// @ts-ignore
		.query(async ({ input, ctx }) => {
			return grid.findByCollectionId(input.collectionId) ?? [];
		}),
	get: procedure
		.input(inputSchema)
		.output(grid.schema.nullable())
		.query(async ({ input, ctx }) => {
			return await grid.getById(input.id);
		}),
	execute: procedure.input(inputSchema).mutation(async ({ input, ctx }) => {
		const data = await grid.getById(input.id);
		if (!data) throw new Error("Grid not found");

		const historyId = nanoid();
		data.history.push({
			_id: historyId,
			createdAt: Date.now(),
			templates: data.templates,
			sets: data.sets,
			results: {},
			fileIds: data.fileIds,
		});
		await grid.update(data);
		return historyId;
	}),
	create: procedure.input(grid.schema).mutation(async ({ input, ctx }) => {
		const data = await grid.create(input);
		return data;
	}),
	update: procedure.input(grid.schema).mutation(async ({ input, ctx }) => {
		const data = await grid.update(input);
		return data;
	}),
	delete: procedure.input(inputSchema).mutation(async ({ input, ctx }) => {
		const data = await grid.getById(input.id);
		if (!data) return null;
		await grid.remove(data);
	}),
	addGridResult: procedure
		.input(
			z.object({
				gridId: z.string(),
				historyId: z.string(),
				versionId: z.string(),
				setId: z.string(),
				result: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const data = await grid.getById(input.gridId);
			if (!data) return null;

			const history = data.history.find((h) => h._id === input.historyId);
			if (!history) return null;

			history.results[`${input.versionId}_${input.setId}`] = input.result;
			await grid.update(data);
		}),
});
