var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all2) => {
  for (var name2 in all2)
    __defProp(target, name2, { get: all2[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  all: () => all,
  canDuplicate: () => canDuplicate,
  canSync: () => canSync,
  create: () => create,
  findByCollectionId: () => findByCollectionId,
  getById: () => getById,
  init: () => init,
  name: () => name,
  remove: () => remove,
  schema: () => schema,
  seed: () => seed,
  templateVersionSchema: () => templateVersionSchema,
  type: () => type,
  update: () => update
});
module.exports = __toCommonJS(stdin_exports);
var import_nanoid = require("nanoid");
var import_zod = require("zod");
var import_database = require("../common/database");
var import_base = require("./base");
var llm = __toESM(require("./llm"));
const name = "Template";
const type = "Template";
const canDuplicate = true;
const canSync = false;
const templateVersionSchema = import_zod.z.object({
  _id: import_zod.z.string(),
  mode: import_zod.z.enum(["chat", "completion"]).default("chat"),
  messages: import_zod.z.array(
    import_zod.z.object({
      _id: import_zod.z.string(),
      role: import_zod.z.enum(["user", "system", "assistant"]).default("user"),
      prompt: import_zod.z.string(),
      inputVariables: import_zod.z.array(import_zod.z.string())
    })
  )
});
const schema = import_base.BaseModelSchema.extend({
  collectionId: import_zod.z.string(),
  workspaceId: import_zod.z.string(),
  name: import_zod.z.string(),
  versions: import_zod.z.array(templateVersionSchema),
  settings: llm.schema,
  variables: import_zod.z.record(import_zod.z.string(), import_zod.z.any()).optional(),
  defaultVersionId: import_zod.z.string().optional(),
  fileIds: import_zod.z.array(import_zod.z.string()).optional().default([])
});
function init() {
  return {
    name: "New Prompt Template"
  };
}
function all() {
  return import_database.database.all(type);
}
function create(patch = {}) {
  return import_database.database.docCreate(type, patch);
}
async function update(patch = {}) {
  const doc = await import_database.database.getWhere(type, { _id: patch._id });
  if (!doc)
    return null;
  const data = await import_database.database.docUpdate(doc, patch);
  return data.affectedDocuments ?? null;
}
function findByCollectionId(_id) {
  return import_database.database.find(type, { collectionId: _id });
}
function remove(template) {
  return import_database.database.remove(template);
}
async function getById(_id) {
  const list = await import_database.database.findMostRecentlyModified(type, {
    _id
  });
  return (list == null ? void 0 : list[0]) ?? null;
}
async function seed() {
  await create({
    workspaceId: "1",
    collectionId: "1",
    name: "Technical Writing",
    settings: {
      modelName: "gpt-3.5-turbo",
      temperature: 0.5
    },
    versions: [
      {
        _id: (0, import_nanoid.nanoid)(),
        mode: "chat",
        messages: [
          {
            _id: (0, import_nanoid.nanoid)(),
            role: "user",
            prompt: `Your new name is TechWritingGPT-4 (Technical Writing GPT-4), an AI designed to rewrite text by applying technical writing strategies to the text. The following rules are strict and must be applied to the user submitted text:
        1 - Use clear and concise language: Avoid jargon, slang, and complex words. Stick to simple and straightforward terms that are easily understood by your target audience.
        2 - Use active voice: Active voice makes your writing more direct and easier to understand. For example, use "The engineer designed the system" instead of "The system was designed by the engineer."
        3 - Use parallelism: Parallelism involves using similar grammatical structures for related ideas. This helps to create a sense of balance and makes your writing easier to follow.
        4 - Use consistent terminology: Choose specific terms for specific concepts and use them consistently throughout your document to avoid confusion.
        5 - Use short sentences: Long sentences can be difficult to follow. Aim for an average sentence length of 20 words or less.
        6 - Avoid nominalizations: Nominalizations are nouns that are derived from verbs or adjectives. They can make your writing more complex and harder to understand. For example, use "decide" instead of "decision-making."
        7 - Use appropriate punctuation: Proper punctuation helps to clarify your meaning and makes your writing more readable.
        8 - Use bullet points and lists: Lists help to break down complex information and make it more accessible to the reader.
        9 - Use headings and subheadings: Headings and subheadings help to organize your content and guide the reader through your document.
        10 - Emphasize important information: Use bold or italic formatting to draw attention to key points, but use these techniques sparingly to maintain readability.
        11 - Write in a logical order: Organize your content in a logical sequence, moving from general to specific information, or following a clear chronological or procedural order.
        12 - Avoid ambiguity: Be specific and precise in your language. Avoid using pronouns like "it" or "they" without a clear antecedent.
        13 - Edit and revise: Carefully review your writing to eliminate grammatical errors, inconsistencies, and awkward phrasings.
        Apply these rules to the following text: {{text}}`,
            inputVariables: ["text"]
          }
        ]
      }
    ]
  });
  await create({
    workspaceId: "1",
    collectionId: "1",
    name: "Learn a new subject",
    settings: {
      modelName: "gpt-3.5-turbo",
      temperature: 0.5
    },
    versions: [
      {
        _id: (0, import_nanoid.nanoid)(),
        mode: "chat",
        messages: [
          {
            _id: (0, import_nanoid.nanoid)(),
            role: "user",
            prompt: `Hi ChatGPT, I need you to help me learn a new subject. Create a comprehensive course plan with detailed lessons and exercises for a [topic] specified by the user, covering a range of experience levels from beginner to advanced based off of [experience level]. The course should be structured with an average of 10 lessons (this needs to change based on what the subject is, eg. harder course is more lessons), using text and code blocks (if necessary) for the lesson format. The user will input the specific [topic] and their [experience level] at the bottom of the prompt.

      Please provide a full course plan, including:
      Course title and brief description
      Course objectives
      Overview of lesson topics
      Detailed lesson plans for each lesson, with:
      a. Lesson objectives
      b. Lesson content (text and code blocks, if necessary)
      c. Exercises and activities for each lesson
      Final assessment or project (if applicable)
      
      [topic] = {{topic}}
      [experience level] = {{level}}`,
            inputVariables: ["topic", "level"]
          }
        ]
      }
    ]
  });
  await create({
    workspaceId: "1",
    collectionId: "1",
    name: "LinkedIn Headlines",
    settings: {
      modelName: "gpt-3.5-turbo",
      temperature: 0.5
    },
    versions: [
      {
        _id: (0, import_nanoid.nanoid)(),
        mode: "chat",
        messages: [
          {
            _id: (0, import_nanoid.nanoid)(),
            role: "user",
            prompt: `
						You are a LinkedIn expert who helps people create the most engaging and effective headlines for their profiles. The individuals want to be part of the top 1% of people who stand out on LinkedIn and attract the right connections, opportunities, and followers.
						The individuals are professionals from various fields, such as founders, marketers, growth marketers, and salespeople, who are eager to showcase their expertise and value proposition. Your goal is to provide headlines that resonate with their target audience.
						
						Please come up with 20 potential LinkedIn headlines.
						
						Consider coming up with headlines that use the following template: Strong hook in the form of a question with an emoji at the end | Follow to [achieve a desirable outcome] | A USP | Current Role @ workplace | Remarkable Achievement
						
						To create the headlines, consider the following information:
						- [Information about your role or expertise ]
						- [ Your target audience ]
						- [ How you help your audience achieve their goals or solve problems ]
						- [ Notable accomplishments ]
						- [ Benefits followers gain from following you ]
						
						Using the information above combine the different elements to create unique and engaging headlines. Ensure the headlines appeal to my target audience and showcase my value proposition effectively.
						
						The tone of the headlines should be:
						
						- Actionable
						- Concise
						- Approachable
						- Compelling
						
						The following are some LinkedIn profile headlines that I like. Consider using them for your inspiration:
						
						1. [Insert LinkedIn profile headline]
						
						2. [Insert LinkedIn profile headline]
						
						3. [Insert LinkedIn profile headline]
						
						4. [Insert LinkedIn profile headline]
						
						5. [Insert LinkedIn profile headline]
						
						\u200D`,
            inputVariables: ["text"]
          }
        ]
      }
    ]
  });
}
