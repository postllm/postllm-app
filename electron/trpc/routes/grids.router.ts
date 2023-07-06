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
    execute: procedure
        .input(inputSchema)
        .mutation(async ({ input, ctx }) => {
            const data = await grid.getById(input.id);
            if (!data) throw new Error("Grid not found");

            const historyId = nanoid();
            data.history.push({
                _id: historyId,
                createdAt: Date.now(),
                templates: data.templates,
                sets: data.sets,
                results: {},
            });
        await grid.update(data);
        return historyId;
    }),
	create: procedure
        .input(grid.schema)
        .mutation(async ({ input, ctx }) => {
            const data = await grid.create(input);
            return data;
        }),
    update: procedure
        .input(grid.schema)
        .mutation(async ({ input, ctx }) => {
            const data = await grid.update(input);
            return data;
        }),
});