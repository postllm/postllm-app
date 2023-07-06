export type TPromptMessage = {
	id: string;
	role: "system" | "user" | "assistant";
	prompt: string;
	inputVariables: string[];
	updatedAt: number;
};

export type TPromptTemplate = {
	_id: string;
	messages: TPromptMessage[];
};

export type TPromptTemplateProps = {
	template: TPromptTemplate;
	onTemplateChange: (template: TPromptTemplate) => void;
	parameters: TVariablesAndParameters;
};

export type TVariables = Record<string, string | number>;

export type TLLMParameters = {
	modelName: string;
	temperature: number;
};

export type TVariablesAndParameters = {
	variables: TVariables;
	llm: TLLMParameters;
};

