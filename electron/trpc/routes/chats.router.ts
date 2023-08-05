/* eslint-disable array-callback-return */
import { nanoid } from "nanoid";
import { z } from "zod";
import { chat } from "../../models";
import { procedure, router } from "../trpc";

const allSchema = z.object({
	collectionId: z.string(),
});

const inputSchema = z.object({
	id: z.string(),
});

export const chatsRouter = router({
	all: procedure
		.input(allSchema)
		.output(chat.schema.array())
		// @ts-ignore
		.query(async ({ input, ctx }) => {
			return chat.findByCollectionId(input.collectionId) ?? [];
		}),
	get: procedure
		.input(inputSchema)
		.output(chat.schema.nullable())
		.query(async ({ input, ctx }) => {
			return await chat.getById(input.id);
		}),
	create: procedure.input(chat.schema).mutation(async ({ input, ctx }) => {
		const data = await chat.create(input);
		return data;
	}),
	update: procedure.input(chat.schema).mutation(async ({ input, ctx }) => {
		const data = await chat.update(input);
		return data;
	}),
	addNewMessage: procedure
		.input(
			z.object({
				id: z.string(),
				role: z.enum(["user", "system", "assistant"]),
				prompt: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const data = await chat.getById(input.id);
			if (!data) return null;

			return await chat.update({
				...data,
				modifiedAt: Date.now(),
				messages: [
					...data.messages,
					{
						_id: nanoid(),
						role: input.role!,
						prompt: input.prompt,
						inputVariables: [],
					},
				],
			});
		}),
	delete: procedure.input(inputSchema).mutation(async ({ input, ctx }) => {
		const data = await chat.getById(input.id);
		if (!data) return null;
		await chat.remove(data);
	}),
});

