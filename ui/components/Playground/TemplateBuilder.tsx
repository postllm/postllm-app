import * as Accordion from "@radix-ui/react-accordion";
import {
	BookmarkFilledIcon,
	CaretSortIcon,
	PlusCircledIcon,
	TrashIcon
} from "@radix-ui/react-icons";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import useAutosizeTextArea from "../../utils/useAutosizeTextArea";
import { Button, IconButton } from "../Shared/Button";
import { Dropdown } from "../Shared/Dropdown";
import { SectionTitle } from "../Shared/SectionTitle";

export const TemplateBuilder = () => {
	const { templateId, versionId } = useParams();
	const utils = trpc.useContext();
	const { data: template } = trpc.templates.get.useQuery({ id: templateId as string });
	const { data: version } = trpc.templates.getVersion.useQuery({id: templateId as string, versionId: versionId as string }, { enabled: !!versionId });
	const { mutate: saveTemplate } = trpc.templates.update.useMutation({
		onSuccess: () => {
			utils.templates.get.invalidate({ id: templateId });
			utils.templates.getVersion.invalidate({ id: templateId, versionId });
		}
	});

	const onAddMessage = useCallback(async () => {
		if (!template) return;
		if (!version) return;

		const role = version.messages.length === 0 ? "system" : version.messages.length % 2 === 0 ? "user" : "assistant";
		const copy = structuredClone(template);
		copy.versions = copy.versions.map((v) => {	 
			if (v._id === version._id) {
				return {
					...v,
					messages: [
						...v.messages,
						{
							_id: nanoid(),
							role,
							prompt: "",
							inputVariables: [],
						},
					],
				};
			} else {
				return v;
			}
		});
		
		await saveTemplate(copy);
	}, [saveTemplate, template, version]);

	const onChangeMessageAttr = useCallback(
		async (id: string, attr: string, val: any) => {
			if (!template) return;
			if (!version) return;

			const timer = setTimeout(async () => {
				const copy = structuredClone(template);
				copy.versions = copy.versions.map((v) => {
					if (v._id === version._id) {
						return {
							...v,
							messages: v.messages.map((message: any) => {
								if (message._id === id) {
									return {
										...message,
										[attr]: val,
										inputVariables: extractVariables(
											attr === "prompt" ? val : message.prompt,
										),
									};
								}
								return message;
							}),
						};
					} else {
						return v;
					}
				});
				
				await saveTemplate(copy);
			}, 100);

		return () => clearTimeout(timer);
		},
		[template, version, saveTemplate],
	);

	const onRemoveMessage = useCallback(
		async (id: string) => {
			if (!template) return;
			if (!version) return;

			await saveTemplate({
				...template,
				versions: template.versions.map((v) => {
					if (v._id === version._id) {
						return {
							...v,
							messages: v.messages.filter(
								(message) => message._id !== id,
							),
						};
					}
					return v;
				})
			});
		},
		[template, saveTemplate, version],
	);

	return (
		<div className="">
			<Accordion.Root
				className="AccordionRoot"
				type="single"
				defaultValue="item-1"
				collapsible
			>
				<Accordion.Item className="AccordionItem" value="item-1">
					<Accordion.AccordionTrigger className="w-full items-center justify-between font-medium transition-all">
						<SectionTitle
							title="Prompt Template"
							leftIcon={<BookmarkFilledIcon className="text-white" />}
							actionIcon={
								<CaretSortIcon className="text-white mr-4" />
							}
						/>
					</Accordion.AccordionTrigger>
					<Accordion.AccordionContent>
						<div className="mb-12">
							{version &&
								version.messages.map((message) => (
									<TemplateSection
										key={[message._id].join('')}
										text={message.prompt}
										selectedKey={message.role}
										onChange={(txt) =>
											onChangeMessageAttr(
												message._id,
												"prompt",
												txt,
											)
										}
										onChangeRole={(role) =>
											onChangeMessageAttr(
												message._id,
												"role",
												role,
											)
										}
										onRemove={() =>
											onRemoveMessage(message._id)
										}
									/>
								))}

							<AddSection onClick={onAddMessage} />
						</div>
					</Accordion.AccordionContent>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	);
};

// @ts-ignore
const AddSection = ({ onClick }) => {
	return (
		<div className="w-full my-2 text-center">
			<Button
				onClick={onClick}
				text="Template"
				leftIcon={<PlusCircledIcon />}
				className="m-auto"
			/>
		</div>
	);
};

const OPTIONS = [
	{ key: "system", value: "System" },
	{ key: "user", value: "User" },
	{ key: "assistant", value: "Assistant" },
];

type TTemplateSectionProps = {
	selectedKey: string;
	text: string;
	onChange: (key: string) => void;
	onChangeRole: (role: string) => void;
	onRemove: () => void;
};

const TemplateSection = ({
	selectedKey,
	text,
	onChangeRole,
	onChange,
	onRemove,
}: TTemplateSectionProps) => {
	const [val, setVal] = useState(text);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	useAutosizeTextArea(textAreaRef.current, text);

	useEffect(() => {
		if (val === text) return;

		const timer = setTimeout(() => {
			onChange(val);
		}, 100);
		return () => clearTimeout(timer);
	}, [onChange, val]);

	return (
		<div className="flex flex-col mt-2 gap-1 border-b border-gray-100 px-6 pt-4 first-of-type:pt-0 dark:border-white/10">
			<div className="group flex justify-between">
				<Dropdown
					label={
						OPTIONS.find((option) => option.key === selectedKey)
							?.value ?? "Select a value"
					}
					onChange={onChangeRole}
					options={OPTIONS}
					rightIcon={<CaretSortIcon />}
				/>
				<div>
					<IconButton
						onClick={onRemove}
						leftIcon={<TrashIcon className="text-white" />}
					/>
				</div>
			</div>
			<div className="grid w-full pb-3">
				<textarea
					ref={textAreaRef}
					value={val ?? ""}
					rows={1}
					onChange={(e) => setVal(e.target.value ?? "")}
					className="m-0 text-sm dark:text-slate-200 resize-none break-words bg-transparent px-0 pb-2 text-transparent caret-black outline-none dark:caret-gray-400"
					placeholder="Enter your message..."
				></textarea>
			</div>
		</div>
	);
};

function extractVariables(str: string) {
	var regex = /\{\{(.*?)\}\}/g;
	var variables = [];
	var match;
	while ((match = regex.exec(str ?? ""))) {
		// @ts-ignore
		variables.push(match[1]);
	}

	return variables;
}

