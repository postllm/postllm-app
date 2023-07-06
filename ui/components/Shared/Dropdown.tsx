import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";

type TDropdownProps = {
	label: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	options: { key: string; value: string }[];
	primary?: boolean;
	onChange?: (key: string) => void;
};

export const Dropdown = ({
	label,
	leftIcon,
	rightIcon,
	options,
	primary,
	onChange,
}: TDropdownProps) => {
	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<div className="relative border-0 hover:border-0">
					<Button
						primary={primary}
						text={label}
						leftIcon={leftIcon}
						rightIcon={rightIcon}
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
					{options.map((option) => (
						<DropdownMenu.Item
							onClick={(e) => {
								e.preventDefault(); 
								onChange?.(option.key)}
							}
							key={option.key}
							className="w-full px-4 py-2 text-left text-sm rounded hover:bg-zinc-100 hover:text-white dark:hover:bg-zinc-800 focus:outline-none cursor-pointer"
						>
							{option.value}
						</DropdownMenu.Item>
					))}

					<DropdownMenu.Arrow className="fill-white" />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

