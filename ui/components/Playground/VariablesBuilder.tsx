import * as Accordion from "@radix-ui/react-accordion";
import { CaretSortIcon, CodeIcon } from "@radix-ui/react-icons";
import { useCallback, useMemo } from "react";
import { SectionTitle } from "../Shared/SectionTitle";
import { VariablesSection } from "../Shared/VariablesSection";
import { LLMParameters } from "./LLMParameters";

type TVariablesBuilderProps = {
	entity: any;
	onUpdateEntity: (entity: any) => void;
	messages: any[];
};

export const VariablesBuilder = ({
	entity,
	onUpdateEntity,
	messages,
}: TVariablesBuilderProps) => {
	const variables = useMemo(() => {
		if (!entity) return [];
		return (messages ?? []).reduce((acc, message) => {
			const s = new Set([...acc, ...message.inputVariables.flat()]);
			return s;
		}, new Set());
	}, [entity]);

	const onChangeVariable = useCallback(
		async (key: string, value: string) => {
			if (!entity) return;

			await onUpdateEntity({
				...entity,
				variables: {
					...entity?.variables,
					[key]: value,
				},
			});
		},
		[entity?.modifiedAt, onUpdateEntity],
	);

	const onLLMChange = useCallback(
		async (key: string, value: any) => {
			if (!entity) return;

			await onUpdateEntity({
				...entity,
				settings: {
					...entity.settings,
					[key]: value,
				},
			});
		},
		[entity?.modifiedAt, onUpdateEntity],
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
									value={entity?.variables?.[variable] || ""}
									onChange={(val) =>
										onChangeVariable(variable, val)
									}
								/>
							),
						)}
						{entity?.settings && (
							<LLMParameters
								key={entity?.modifiedAt}
								onChange={onLLMChange}
								modelName={entity.settings.modelName}
								temperature={entity.settings.temperature}
							/>
						)}
					</Accordion.AccordionContent>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	);
};

