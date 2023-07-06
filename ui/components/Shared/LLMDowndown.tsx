import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";

const LLMS = [
	{
		name: "Most Common",
		llms: [
			{
				modelName: "gpt-3.5-turbo",
				description:
					"Most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003.",
				context: 4096,
				input: 1000,
				output: 1000,
			},
			{
				modelName: "gpt-4",
				description:
					"More capable than any GPT-3.5 model, able to do more complex tasks, and optimized for chat.",
				context: 4096,
				input: 1000,
				output: 1000,
			},
		],
	},
	{
		name: "Others",
		llms: [
			{
				modelName: "gpt-3.5-turbo-16k",
				description:
					"Same capabilities as the standard gpt-3.5-turbo model but with 4 times the context.",
				context: 16384,
				input: 0,
				output: 0,
			},
			{
				modelName: "gpt-3.5-turbo-0613",
				description:
					"Snapshot of gpt-3.5-turbo from June 13th 2023 with function calling data.",
				context: 4096,
				input: 1000,
				output: 1000,
			},
			{
				modelName: "gpt-4-0613",
				description:
					"Snapshot of gpt-4 from June 13th 2023 with function calling data.",
				context: 8192,
				input: 0,
				output: 0,
			},
			{
				modelName: "gpt-4-32k",
				description:
					"Same capabilities as the base gpt-4 mode but with 4x the context length.",
				context: 32768,
				input: 0,
				output: 0,
			},
			{
				modelName: "gpt-4-32k-0613",
				description: "Snapshot of gpt-4-32 from June 13th 2023.",
				context: 32768,
				input: 0,
				output: 0,
			},
		],
	},
];

type TDropdownProps = {
	label: string;
	primary?: boolean;
	onChange?: (key: string) => void;
};

export const LLMDropdown = ({ label, primary, onChange }: TDropdownProps) => {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<div className="relative border-0 hover:border-0 w-full">
					<Button
						primary={primary}
						text={label}
						rightIcon={<CaretSortIcon />}
						className="w-full text-left"
					/>
				</div>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className={twMerge(
						"z-50 min-w-[200px]",
						"rounded bg-white px-2 py-5 text-sm text-zinc-500 ring-1 ring-zinc-900/10 transition hover:ring-zinc-900/20 dark:bg-[#1D1D20] dark:text-zinc-400 dark:ring-inset dark:ring-white/10 dark:hover:ring-white/20 focus:[&:not(:focus-visible)]:outline-none",
						"will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade",
					)}
					sideOffset={10}
				>
					{LLMS.map((group) => (
						<div key={group.name}>
							<DropdownMenu.Label className="px-4 text-white font-bold leading-[25px]">
								{group.name}
							</DropdownMenu.Label>
							<DropdownMenu.Group>
								{group.llms.map((llm) => (
									<DropdownMenu.Item
										onClick={() =>
											onChange?.(llm.modelName)
										}
										key={llm.modelName}
										className="w-full px-4 py-2 text-left text-sm rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none cursor-pointer last:mb-4"
									>
										{llm.modelName}
									</DropdownMenu.Item>
								))}
							</DropdownMenu.Group>
						</div>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

