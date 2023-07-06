type TVariablesSectionProps = {
	varName: string;
	value: string;
	onChange: (val: string) => void;
};

export const VariablesSection = ({
	varName,
	value,
	onChange,
}: TVariablesSectionProps) => {
	return (
		<div className="px-6 pb-5">
			<div className="grid grid-cols-[auto,1fr] items-center gap-2">
				<label
					className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-mono text-xs"
					htmlFor=""
				>
					{varName} =
				</label>
				<textarea
					defaultValue={value}
					onChange={(e) => onChange(e.target.value)}
					className="block h-9 w-full resize-none  border-0 border-b p-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-zinc-600 focus:ring-0 dark:border-white/10 dark:bg-transparent dark:text-white dark:focus:border-zinc-600 dark:focus:outline-0 sm:leading-5"
					placeholder="Enter a value.."
				></textarea>
			</div>
		</div>
	);
};
