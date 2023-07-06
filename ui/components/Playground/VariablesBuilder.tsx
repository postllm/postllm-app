import * as Accordion from "@radix-ui/react-accordion";
import { CaretSortIcon, CodeIcon } from "@radix-ui/react-icons";
import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { SectionTitle } from "../Shared/SectionTitle";
import { VariablesSection } from "../Shared/VariablesSection";
import { LLMParameters } from "./LLMParameters";

export const VariablesBuilder = () => {
	const { templateId, versionId } = useParams();
	const utils = trpc.useContext();
	const { data: version } = trpc.templates.getVersion.useQuery(
		{
			id: templateId as string,
			versionId: versionId as string,
		},
		{ enabled: !!templateId && !!versionId },
	);
	const { data: template } = trpc.templates.get.useQuery(
		{
			id: templateId as string,
		},
		{ enabled: !!templateId },
	);
	const { mutate: saveTemplate } = trpc.templates.update.useMutation({
		onSuccess: () => {
			utils.templates.get.invalidate({ id: templateId });
		},
	});

	const variables = useMemo(() => {
		if (!version) return [];
		return version.messages.reduce((acc, message) => {
			const s = new Set([...acc, ...message.inputVariables.flat()]);
			return s;
		}, new Set());
	}, [version]);

	const onChangeVariable = useCallback(
		async (key: string, value: string) => {
			if (!template) return;

			await saveTemplate({
				...template,
				variables: {
					...template?.variables,
					[key]: value,
				},
			});
			utils.templates.get.invalidate({ id: templateId });
		},
		[saveTemplate, template],
	);

	const onLLMChange = useCallback(
		async (key: string, value: any) => {
			if (!template) return;

			await saveTemplate({
				...template,
				settings: {
					...template.settings,
					[key]: value,
				},
			});
			utils.templates.get.invalidate({ id: templateId });
		},
		[saveTemplate, template],
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
							title="Variables & Parameters"
							leftIcon={<CodeIcon className="text-white" />}
							actionIcon={
								<CaretSortIcon className="text-white mr-4" />
							}
						/>
					</Accordion.AccordionTrigger>
					<Accordion.AccordionContent>
						{[...(variables as string[])].map(
							(variable: string) => (
								<VariablesSection
									key={variable}
									varName={variable}
									// @ts-ignore
									value={
										template?.variables?.[variable] || ""
									}
									onChange={(val) =>
										onChangeVariable(variable, val)
									}
								/>
							),
						)}
						{template?.settings && (
							<LLMParameters
								onChange={onLLMChange}
								modelName={template.settings.modelName}
								temperature={template.settings.temperature}
							/>
						)}
					</Accordion.AccordionContent>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	);
};

