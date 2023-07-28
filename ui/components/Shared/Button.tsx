import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type TButtonProps = {
	text: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	onClick?: (e: any) => void;
	disabled?: boolean;
	primary?: boolean;
	secondary?: boolean;
	className?: string;
	tooltip?: string;
};

export const Button = ({
	disabled,
	text,
	onClick,
	leftIcon,
	primary,
	secondary,
	rightIcon,
	className,
	tooltip,
}: TButtonProps) => {
	return (
		<Tooltip.Provider>
			<Tooltip.Root open={!tooltip ? false : undefined}>
				<Tooltip.Trigger asChild>
					<button
						onClick={onClick}
						disabled={disabled}
						className={twMerge(
							"inline-flex gap-2 justify-center items-center overflow-hidden text-sm font-medium transition rounded-full py-1 px-3 text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-200 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-white",
							primary
								? "inline-flex justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-1 dark:ring-inset dark:ring-emerald-400/20 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300 dark:hover:ring-emerald-300"
								: "",
							secondary
								? "inline-flex justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-1 dark:ring-inset dark:ring-orange-400/20 dark:hover:bg-orange-400/10 dark:hover:text-orange-300 dark:hover:ring-orange-300"
								: "",
							className,
							disabled ? "cursor-not-allowed" : "",
						)}
					>
						{leftIcon}
						{text}
						{rightIcon}
					</button>
				</Tooltip.Trigger>
				<Tooltip.Portal>
					<Tooltip.Content
						className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
						sideOffset={5}
					>
						{tooltip}
					</Tooltip.Content>
				</Tooltip.Portal>
			</Tooltip.Root>
		</Tooltip.Provider>
	);
};

type TIconButtonProps = {
	leftIcon?: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	primary?: boolean;
};

export const IconButton = ({
	disabled,
	onClick,
	leftIcon,
	primary,
}: TIconButtonProps) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={twMerge(
				"inline-flex h-8 min-w-8 justify-center items-center overflow-hidden text-sm font-medium transition rounded-full py-1 px-3 text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-200 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-white",
				primary
					? "inline-flex justify-center overflow-hidden text-sm font-medium transition rounded-full bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-1 dark:ring-inset dark:ring-emerald-400/20 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-300 dark:hover:ring-emerald-300"
					: "",
			)}
		>
			{leftIcon}
		</button>
	);
};

type TCopyButtonProps = {
	text: string;
	className?: string;
};

export const CopyButton = ({ text, className }: TCopyButtonProps) => {
	const [copied, setCopied] = useState(false);

	const onClick = async () => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 1000);
	};

	return (
		<Button
			onClick={onClick}
			text={copied ? "Copied" : "Copy"}
			leftIcon={
				copied ? (
					<CheckIcon className="w-3 h-3 text-xs" />
				) : (
					<CopyIcon className="w-3 h-3 text-xs" />
				)
			}
			className={className}
		/>
	);
};

