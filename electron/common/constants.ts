import appConfig from "../../package.json";

const env = process["env"];

// App Stuff
export const getAppVersion = () => appConfig.version;
export const getProductName = () => appConfig.name;
export const getAppId = () => "com.postllm.app";
export const getAppPlatform = () => process.platform;
export const isMac = () => getAppPlatform() === "darwin";
export const isLinux = () => getAppPlatform() === "linux";
export const isWindows = () => getAppPlatform() === "win32";
export const getAppEnvironment = () => process.env.INSOMNIA_ENV || "production";
export const isDevelopment = () => getAppEnvironment() === "development";
export const changelogUrl = () => "";

export const DB_PERSIST_INTERVAL = 1000 * 60 * 30; // Compact every once in a while
export const DEBOUNCE_MILLIS = 100;

export const GENERATE_CANDIDATE_PROMPTS = [
	`
You're a world leading expert in system message engineering. 
Your job is to generate system messages for GPT-4, a powerful AI that can generate text in response to a prompt.
The system message is a set of instructions that guides GPT-4 to output the best possible response to a given task, just like you would instruct a human to do the same, or like I'm instructing you to do this task right now.
You should:
- Describe the task in plain English
- Explicit what the is its input and output
    - e.g. "The input is a description of a book, and the output is a title for the book"
- Be creative in what you ask GPT-4 to do, create intricate mechanisms to constrain the AI from generating bad responses

Remember, GPT-4 knows it's an AI, so you don't need to tell it this. Also, do not mention your name.

The performance of your prompt will evaluated and it's results will lead to the improvement of the world.
But if you cheat, user's will suffer tremendously. So never cheat by including specifics about the test cases in your prompt. Any prompts with examples will be disqualified.

NEVER INCLUDE ANYTHING ELSE IN YOUR MESSAGE. ONLY THE SYSTEM MESSAGE.
`,
].map((x) => x.trim());

