import { nanoid } from "nanoid";
import { IBaseModel } from "./base";
import * as _collection from "./collection";
import * as _config from "./config";
import * as _grid from "./grid";
import * as _llm from "./llm";
import * as _promptTemplate from "./prompt-template";
import * as _workspace from "./workspace";


export const promptTemplate = _promptTemplate;
export const collection = _collection;
export const workspace = _workspace;
export const config = _config;
export const grid = _grid;
export const llm = _llm;

export function all() {
	return [_promptTemplate, _collection, _workspace, _config, _grid, _llm] as const;
}

export function types() {
	return all().map((model) => model.type);
}

export function getModel(type: string) {
	return all().find((m) => m.type === type) || null;
}

export async function initModel<T extends IBaseModel>(
	type: string,
	...sources: Record<string, any>[]
): Promise<T> {
	const model = getModel(type);

	if (!model) {
		const choices = all()
			.map((m) => m.type)
			.join(", ");
		throw new Error(
			`Tried to init invalid model "${type}". Choices are ${choices}`,
		);
	}

	// Define global default fields
	const objectDefaults = Object.assign(
		{},
		{
			_id: null,
			type: type,
			modifiedAt: Date.now(),
			createdAt: Date.now(),
		},
		model.init(),
	);
	const fullObject = Object.assign({}, objectDefaults, ...sources);

	if (!fullObject._id) {
		fullObject._id = nanoid();
	}

	return fullObject;
}

