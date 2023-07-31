/* eslint-disable array-callback-return */
import { observable } from "@trpc/server/observable";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
	AIMessagePromptTemplate,
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "langchain/prompts";
import { z } from "zod";
import { GENERATE_CANDIDATE_PROMPTS } from "../../common/constants";
import { config, llm, promptTemplate } from "../../models";
import { procedure, router } from "../trpc";

const submitSchema = z.object({
	templateId: z.string(),
	versionId: z.string(),
	messages: z.array(
		z.object({
			prompt: z.string(),
			role: z.string(),
		}),
	),
	variables: z.record(z.string(), z.any()).optional(),
	llm: llm.schema.optional(),
});

const completionSchema = z.object({
	temperature: z.number(),
	modelName: z.string(),
	streaming: z.boolean().default(false),
	text: z.array(z.string()),
});

const genCandidateSchema = z.object({
	count: z.number().default(1),
	text: z.string(),
});

async function generateOpenAIBearerConfig() {
	const configuration = await config.get();
	return configuration?.apiKeys?.openAIEndpoint
		? { apiKey: configuration?.apiKeys?.openAIKey, basePath: configuration?.apiKeys?.openAIEndpoint }
		: undefined; // no need setting for openAI configs
}

export const llmRouter = router({
	genPromptCandidates: procedure
		.input(genCandidateSchema)
		.mutation(async ({ input }) => {
			const configuration = await config.get();
			const bearerConfig = await generateOpenAIBearerConfig();

			const chat = new ChatOpenAI({
				modelName: "gpt-4",
				temperature: 0.9,
				streaming: false,
				openAIApiKey: configuration?.apiKeys?.openAIKey,
				n: input.count,
			}, bearerConfig);

			const rand = Date.now() % GENERATE_CANDIDATE_PROMPTS.length;
			const system = SystemMessagePromptTemplate.fromTemplate(
				GENERATE_CANDIDATE_PROMPTS[rand],
			);
			const user = HumanMessagePromptTemplate.fromTemplate(input.text);

			const chain = new LLMChain({
				llm: chat,
				prompt: ChatPromptTemplate.fromPromptMessages([system, user]),
			});

			const res = await chain.call([]);
			return res;
		}),
	completion: procedure
		.input(completionSchema)
		.mutation(async ({ input }) => {
			const configuration = await config.get();
			const bearerConfig = await generateOpenAIBearerConfig();

			const chat = new ChatOpenAI({
				modelName: input.modelName,
				temperature: input.temperature,
				streaming: input.streaming,
				openAIApiKey: configuration?.apiKeys?.openAIKey,
			}, bearerConfig);

			const chain = new LLMChain({
				llm: chat,
				prompt: ChatPromptTemplate.fromPromptMessages(input.messages),
			});

			const res = await chain.call([]);
			return res;
		}),
	submit: procedure
		.input(submitSchema)
		.subscription(async ({ input, ctx }) => {
			try {
				const configuration = await config.get();
				const bearerConfig = await generateOpenAIBearerConfig();

				const template = await promptTemplate.getById(input.templateId);
				const version = (template?.versions ?? []).find(
					(v) => v._id === input.versionId,
				);

				if (!template || !version)
					throw new Error("Template or version not found");

				const variables = input.variables ?? template.variables ?? {};
				let messages = version.messages.map((m) => {
					const cleaned = cleanPrompt(m.prompt, variables);
					switch (m.role) {
						case "user":
							return HumanMessagePromptTemplate.fromTemplate(
								cleaned,
							);
						case "system":
							return SystemMessagePromptTemplate.fromTemplate(
								cleaned,
							);
						case "assistant":
							return AIMessagePromptTemplate.fromTemplate(
								cleaned,
							);
					}
				});

				const rest = input.messages.map((m) => {
					const cleaned = cleanPrompt(m.prompt, variables);
					switch (m.role) {
						case "system":
							return SystemMessagePromptTemplate.fromTemplate(
								cleaned,
							);
						case "assistant":
							return AIMessagePromptTemplate.fromTemplate(
								cleaned,
							);
						case "user":
						default:
							return HumanMessagePromptTemplate.fromTemplate(
								cleaned,
							);
					}
				});

				const modelName =
					input.llm?.modelName ?? template.settings.modelName;
				const temperature =
					input.llm?.temperature ?? template.settings.temperature;

				const chat = new ChatOpenAI({
					modelName,
					temperature,
					streaming: true,
					openAIApiKey: configuration?.apiKeys?.openAIKey,
				}, bearerConfig);

				const chain = new LLMChain({
					llm: chat,
					prompt: ChatPromptTemplate.fromPromptMessages([
						...messages,
						...rest,
					]),
				});

				return observable((emit) => {
					chain
						.call(variables, [
							{
								handleLLMNewToken(token: string) {
									emit.next(token);
								},
							},
						])
						.finally(() => {
							emit.complete();
						});

					return () => {};
				});
			} catch (e) {
				console.error(e);
			}
		}),
});

function cleanPrompt(text: string, variables: Record<string, any>) {
	let txt = text;
	for (const key of Object.keys(variables)) {
		txt = txt.replaceAll(`{{${key}}}`, `{${key}}`);
	}

	return txt;
}

