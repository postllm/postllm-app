import * as Accordion from "@radix-ui/react-accordion";
import {
	BookmarkFilledIcon,
	CaretSortIcon,
	Cross2Icon,
	DotsVerticalIcon,
	PlusCircledIcon,
} from "@radix-ui/react-icons";
import { nanoid } from "nanoid";
import { useCallback, useMemo, version } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { DocumentsBuilder } from "../Playground/DocumentsBuilder";
import { LLMParameters } from "../Playground/LLMParameters";
import { Button } from "../Shared/Button";
import { Dropdown } from "../Shared/Dropdown";
import { SectionTitle } from "../Shared/SectionTitle";
import { VariablesSection } from "../Shared/VariablesSection";
import { TemplateVersionsDropdown } from "./TemplateVersionsDropdown";

export const GridSideArea = () => {
	const { collectionId, workspaceId, gridId } = useParams();
	const utils = trpc.useContext();
	const { data: templates } = trpc.templates.all.useQuery({
		collectionId: collectionId as string,
	});
	const { data: grid } = trpc.grids.get.useQuery({ id: gridId as string });
	const { mutateAsync: updateGrid } = trpc.grids.update.useMutation();

	const variables = useMemo(() => {
		if (!version) return [];
		return grid?.templates.reduce((acc, tmpl) => {
			const template = templates?.find((t) => t._id === tmpl.templateId);
			const version = template?.versions.find(
				(v) => v._id === tmpl.versionId,
			);
			if (!template || !version) return acc;

			const s = new Set([
				...acc,
				...version.messages.map((m) => m.inputVariables).flat(),
			]);
			return s;
		}, new Set());
	}, [grid, templates]);

	const onToggleFile = useCallback(async (fileId: string) => {
		if (!grid) return;

		let fileIds = grid.fileIds ?? [];
		if (fileIds.includes(fileId))
			fileIds = fileIds.filter((id) => id !== fileId);
		else fileIds.push(fileId);

		await updateGrid({ ...grid, fileIds });

		utils.grids.get.invalidate({ id: gridId as string });
	}, []);

	const onVersionChange = useCallback(
		async (templateId: string, versionId: string) => {
			if (!templateId || !versionId) return;
			if (!grid) return;

			const template = grid.templates.find(
				(t) => t.templateId === templateId && t.versionId === versionId,
			);
			if (template) {
				await updateGrid({
					...grid,
					templates: grid.templates.filter(
						(t) => t._id !== template._id,
					),
				});
			} else {
				await updateGrid({
					...grid,
					templates: [
						...grid.templates,
						{
							_id: nanoid(),
							templateId,
							versionId,
						},
					],
				});
			}

			utils.grids.get.invalidate({ id: gridId as string });
		},
		[gridId, grid, updateGrid, utils],
	);

	const onAddParameter = useCallback(async () => {
		if (!grid) return;

		await updateGrid({
			...grid,
			sets: [
				...grid.sets,
				{
					_id: nanoid(),
					name: `Variables Set #${grid.sets.length + 1}`,
					variables: {},
					llm: {
						modelName: "gpt-3.5-turbo",
						temperature: 0.7,
					},
				},
			],
		});

		utils.grids.get.invalidate({ id: gridId as string });
	}, [gridId, grid, updateGrid, utils]);

	const onChangeParameter = useCallback(
		async (id: string, key: string, value: any) => {
			if (!grid) return;

			await updateGrid({
				...grid,
				sets: grid.sets.map((set, i) => {
					if (set._id === id) {
						return {
							...set,
							llm: {
								...set.llm,
								[key]: value,
							},
						};
					} else {
						return set;
					}
				}),
			});

			utils.grids.get.invalidate({ id: gridId as string });
		},
		[grid, updateGrid, utils],
	);

	const onChangeVariable = useCallback(
		async (id: string, key: string, value: any) => {
			if (!grid) return;

			console.log(id, key, value);

			await updateGrid({
				...grid,
				sets: grid.sets.map((set, i) => {
					if (set._id === id) {
						return {
							...set,
							variables: {
								...set.variables,
								[key]: value,
							},
						};
					} else {
						return set;
					}
				}),
			});

			utils.grids.get.invalidate({ id: gridId as string });
		},
		[grid, updateGrid, utils],
	);

	const onVariablesSetOption = useCallback(
		async (action: string, id: string) => {
			if (!grid) return;

			if (action === "delete") {
				await updateGrid({
					...grid,
					sets: grid.sets.filter((set) => set._id !== id),
				});
			}

			if (action === "duplicate") {
				const copy = structuredClone(
					grid.sets.find((set) => set._id === id),
				);
				if (!copy) return;

				copy._id = nanoid();
				(copy.name = `Variables Set #${grid.sets.length + 1}`),
					await updateGrid({ ...grid, sets: [...grid.sets, copy] });
			}

			utils.grids.get.invalidate({ id: gridId as string });
		},
		[grid, updateGrid, utils],
	);

	return (
		<div className="grid grid-rows-[minmax(0,1fr),auto] !overflow-auto border-r border-white/10 min-w-[350px] h-screen">
			<div className="overflow-y-auto pt-2">
				<div className="w-full items-center justify-between font-medium transition-all">
					<SectionTitle
						title="Prompt Templates"
						leftIcon={<BookmarkFilledIcon className="text-white" />}
					/>
					<ul className="dark:divide-white/5 text-sm">
						{grid?.templates.map((t) => {
							const template = templates?.find(
								(template) => template._id === t.templateId,
							);
							const version =
								template?.versions.findIndex(
									(v) => v._id === t.versionId,
								) ?? 0;
							const versionCount = template?.versions.length ?? 0;

							return (
								<li
									key={t.versionId}
									className="m-0 text-left px-4 py-2 first:pt-2 last:pb-0 text-zinc-400 dark:text-zinc-500"
								>
									<div className="flex gap-2">
										<p>
											{template?.name}{" "}
											{version === 0
												? "(Latest)"
												: `(v${
														versionCount - version
												  })`}
										</p>
										<div className="ml-auto">
											<Button
												onClick={() =>
													onVersionChange(
														t.templateId,
														t.versionId,
													)
												}
												rightIcon={
													<Cross2Icon className="w-3 h-3" />
												}
												text=""
											/>
										</div>
									</div>
								</li>
							);
						})}
					</ul>
					<div className="w-full my-2 text-center">
						<TemplateVersionsDropdown
							collectionId={collectionId!}
							onChange={onVersionChange}
							selectedIds={
								grid?.templates.map((t) => t.versionId) ?? []
							}
						/>
					</div>
				</div>

				<div className="mt-5 w-full ont-medium transition-all">
					<SectionTitle
						title="Variables Sets"
						leftIcon={<BookmarkFilledIcon className="text-white" />}
					/>

					<div>
						<ul className="dark:divide-white/5">
							<Accordion.Root type="multiple">
								{grid?.sets.map((set) => {
									return (
										<Accordion.Item
											key={set._id}
											className="AccordionItem"
											value={set._id}
										>
											<Accordion.AccordionTrigger className="w-full transition-all text-sm">
												<li className="m-0 text-left px-4 py-4 my-2 first:pt-0 last:pb-0 text-zinc-400 dark:text-zinc-500">
													<div className="flex gap-2 hover:text-white">
														<CaretSortIcon className="w-4 h-4 mt-1" />
														<span>{set.name}</span>
														<div className="ml-auto">
															<Dropdown
																onChange={(a) =>
																	onVariablesSetOption(
																		a,
																		set._id,
																	)
																}
																leftIcon={
																	<DotsVerticalIcon className="w-3 h-3" />
																}
																label={""}
																options={[
																	{
																		key: "duplicate",
																		value: "Duplicate",
																	},
																	{
																		key: "delete",
																		value: "Remove",
																	},
																]}
															/>
														</div>
													</div>
												</li>
											</Accordion.AccordionTrigger>
											<Accordion.AccordionContent>
												<div className="w-full flex flex-col text-white text-sm">
													{[
														...(variables as string[]),
													].map(
														(variable: string) => (
															<VariablesSection
																key={variable}
																varName={
																	variable
																}
																// @ts-ignore
																value={
																	set
																		?.variables?.[
																		variable
																	] || ""
																}
																onChange={(v) =>
																	onChangeVariable(
																		set._id,
																		variable,
																		v,
																	)
																}
															/>
														),
													)}
													<LLMParameters
														temperature={
															set.llm.temperature
														}
														modelName={
															set.llm.modelName
														}
														onChange={(k, v) =>
															onChangeParameter(
																set._id,
																k,
																v,
															)
														}
													/>
												</div>
											</Accordion.AccordionContent>
										</Accordion.Item>
									);
								})}
							</Accordion.Root>
						</ul>
						<div className="w-full my-2 text-center">
							<Button
								onClick={onAddParameter}
								text="New variables Set"
								leftIcon={<PlusCircledIcon />}
								className="m-auto"
							/>
						</div>
					</div>
				</div>

				<DocumentsBuilder
					collectionId={collectionId!}
					workspaceId={workspaceId!}
					fileIds={grid?.fileIds || []}
					onToggleFile={onToggleFile}
				/>
			</div>
		</div>
	);
};

