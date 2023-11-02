/* eslint-disable array-callback-return */
import { observable } from "@trpc/server/observable";
import { ConversationalRetrievalQAChain, LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
	AIMessagePromptTemplate,
	ChatPromptTemplate,
	HumanMessagePromptTemplate,
	SystemMessagePromptTemplate,
} from "langchain/prompts";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { z } from "zod";
import { GENERATE_CANDIDATE_PROMPTS } from "../../common/constants";
import { getDataDirectory } from "../../common/database";
import { config, llm, promptTemplate } from "../../models";
import { procedure, router } from "../trpc";

const submitSchema = z.object({
	collectionId: z.string(),
	workspaceId: z.string(),
	templateId: z.string().optional(),
	versionId: z.string().optional(),
	messages: z.array(
		z.object({
			prompt: z.string(),
			role: z.string(),
		}),
	),
	variables: z.record(z.string(), z.any()).optional(),
	llm: llm.schema.optional(),
	fileIds: z.array(z.string()).optional().default([]),
});

const completionSchema = z.object({
	temperature: z.number(),
	delimiter: z.string().optional(),
	modelName: z.string(),
	streaming: z.boolean().default(false),
	text: z.array(z.string()),
});

const genCandidateSchema = z.object({
	count: z.number().default(1),
	text: z.string(),
});

export const llmRouter = router({
	genPromptCandidates: procedure
		.input(genCandidateSchema)
		.mutation(async ({ input }) => {
			const configuration = await config.get();

			const chat = new ChatOpenAI({
				modelName: "gpt-4",
				temperature: 0.9,
				streaming: false,
				openAIApiKey: configuration?.apiKeys?.openAIKey,
				n: input.count,
			});

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

			const chat = new ChatOpenAI({
				modelName: input.modelName,
				temperature: input.temperature,
				streaming: input.streaming,
				openAIApiKey: configuration?.apiKeys?.openAIKey,
				stop: input.delimiter ? [input.delimiter] : undefined,
			});

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
				const template = await promptTemplate.getById(
					input.templateId ?? "0",
				);
				const version = (template?.versions ?? []).find(
					(v) => v._id === input.versionId,
				);

				const variables = input.variables ?? template?.variables ?? {};
				let messages = (version?.messages ?? []).map((m) => {
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
					input.llm?.modelName ?? template?.settings.modelName;
				const temperature =
					input.llm?.temperature ?? template?.settings.temperature;
				const delimiter =
					input.llm?.delimiter ?? template?.settings.delimiter;

				const embeddings = new OpenAIEmbeddings({
					openAIApiKey: configuration?.apiKeys?.openAIKey,
				});
				const chat = new ChatOpenAI({
					modelName,
					temperature,
					streaming: true,
					openAIApiKey: configuration?.apiKeys?.openAIKey,
					stop: delimiter ? [delimiter] : undefined,
				});

				const chain = new LLMChain({
					llm: chat,
					prompt: ChatPromptTemplate.fromPromptMessages([
						...messages,
						...rest,
					]),
				});

				let chain2: ConversationalRetrievalQAChain | undefined =
					undefined;
				const fileIds = input.fileIds ?? [];
				if (fileIds.length > 0) {
					const base = getDataDirectory();
					const directory =
						base + "/embeddings/" + input.collectionId;

					const vectorStore = await HNSWLib.load(
						directory,
						embeddings,
					);

					chain2 = ConversationalRetrievalQAChain.fromLLM(
						chat,
						vectorStore.asRetriever(undefined, (doc) => {
							return fileIds.includes(doc.metadata.fileId);
						}),
						{
							questionGeneratorChainOptions: {
								template: `
								History:
								{chat_history}
								
								Question: 
								{question}
								
								Your answer:
								`,
							},
						},
					);

					const history = [...messages, ...rest];
					const last = history.pop();

					variables["chat_history"] = (
						await ChatPromptTemplate.fromPromptMessages(
							history,
						).formatMessages(variables)
					)
						.map((m) => `${m._getType()}: ${m.content}`)
						.join("\n");
					variables["question"] = (
						await ChatPromptTemplate.fromPromptMessages([
							last!,
						]).formatMessages(variables)
					)
						.map((m) => `${m._getType()}: ${m.content}`)
						.join("\n");
				}

				return observable((emit) => {
					(chain2 ?? chain)
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

