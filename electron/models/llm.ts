import { z } from "zod";

export const name = "LLM";
export const type = "LLM";

export const schema = z.object({
	modelName: z.string().default("gpt-3.5-turbo"),
	temperature: z.number().default(0.5),
	maxTokens: z.number().optional(),
});

export type ILLM = z.infer<typeof schema>;

export function init() {
	return {};
}

