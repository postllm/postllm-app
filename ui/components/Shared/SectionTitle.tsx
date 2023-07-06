type TSectionTitleProps = {
	title: string;
	leftIcon?: React.ReactNode;
	actionIcon?: React.ReactNode;
	onActionClick?: () => void;
};

export const SectionTitle = ({
	title,
	leftIcon,
	actionIcon,
	onActionClick,
}: TSectionTitleProps) => {
	return (
		<div className="flex h-9 items-center justify-center border-y border-b-white/7.5 border-t-transparent bg-white/2.5 bg-zinc-900 px-4 dark:border-b-white/5 dark:bg-white/1">
			<div className="flex w-full">
				{leftIcon}
				<span className="ml-3 text-sm text-white font-bold">
					{title}
				</span>
				{actionIcon && (
					<button
						onClick={onActionClick}
						title="New Prompt Collection"
						className="ml-auto text-zinc-400 hover:text-zinc-200 transition-colors"
					>
						{actionIcon}
					</button>
				)}
			</div>
		</div>
	);
};

