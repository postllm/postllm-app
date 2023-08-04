import * as fs from "fs";
import { BaseDocumentLoader } from "langchain/dist/document_loaders/base";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getDataDirectory } from "../../common/database";
import { config, file } from "../../models";
import { procedure, router } from "../trpc";

const inputSchema = z.object({
	id: z.string(),
});

const allSchema = z.object({
	collectionId: z.string(),
});

const upsertSchema = z.object({
	name: z.string(),
	path: z.string(),
	type: z.string(),
	collectionId: z.string(),
	workspaceId: z.string(),
	id: z.string().optional(),
	_id: z.string().optional(),
});

export const filesRouter = router({
	all: procedure
		.input(allSchema)
		.output(file.schema.array())
		// @ts-ignore
		.query(async ({ input, ctx }) => {
			const all = await file.findByCollectionId(input.collectionId);
			return all;
		}),
	get: procedure
		.input(inputSchema)
		.output(file.schema.nullable())
		.query(async ({ input, ctx }) => {
			const col = await file.getById(input.id);
			return col;
		}),
	add: procedure
		.input(upsertSchema)
		.output(file.schema)
		.mutation(async ({ input, ctx }) => {
			const configuration = await config.get();
			const embeddings = new OpenAIEmbeddings({
				openAIApiKey: configuration?.apiKeys?.openAIKey,
			});

			let loader: BaseDocumentLoader;
			// Create docs with a loader
			if (input.type === "application/pdf") {
				loader = new PDFLoader(input.path);
			} else if (
				input.type ===
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
				input.type === "application/msword"
			) {
				loader = new DocxLoader(input.path);
			} else {
				loader = new TextLoader(input.path);
			}
			const docs = await loader.load();

			const fileId = nanoid();
			for (const doc of docs) {
				doc.metadata = { ...doc.metadata, fileId };
			}

			const base = getDataDirectory();
			const directory = base + "/embeddings/" + input.collectionId;
			if (fs.existsSync(directory)) {
				const vectorStore = await HNSWLib.load(directory, embeddings);
				vectorStore.addDocuments(docs);
				await vectorStore.save(directory);
			} else {
				const vectorStore = await HNSWLib.fromDocuments(
					docs,
					embeddings,
				);
				await vectorStore.save(directory);
			}

			const col = await file.create({
				_id: fileId,
				createdAt: Date.now(),
				modifiedAt: Date.now(),
				...input,
			});

			return col;
		}),
	delete: procedure.input(inputSchema).mutation(async ({ input, ctx }) => {
		const doc = await file.getById(input.id);
		if (!doc) return;

		await file.remove(doc);

		return null;
	}),
});

