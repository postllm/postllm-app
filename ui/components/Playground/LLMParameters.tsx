import * as Slider from "@radix-ui/react-slider";
import { useCallback, useState } from "react";
import { LLMDropdown } from "../Shared/LLMDowndown";

type TLLMParametersProps = {
	temperature: number;
	delimiter?: string;
	modelName: string;
	onChange: (key: string, value: string | number) => void;
};

export const LLMParameters = ({
	temperature,
	onChange,
	delimiter,
	modelName,
}: TLLMParametersProps) => {
	const onModelChange = useCallback(async (modelName: string) => {
		onChange("modelName", modelName);
	}, []);

	const onTemperatureChange = useCallback(async (temperature: number) => {
		onChange("temperature", temperature);
	}, []);

	const onDelimiterChange = useCallback(async (delimiter: string) => {
		onChange("delimiter", delimiter);
	}, []);

	return (
		<div className="flex flex-wrap gap-3 mt-2 px-6 pb-4">
			<LLMDropdown label={modelName} onChange={onModelChange} />
			<LLMTemperature
				temperature={temperature}
				onChange={onTemperatureChange}
			/>
			<LLMDelimiter delimiter={delimiter} onChange={onDelimiterChange} />
		</div>
	);
};

type TLLMTemperatureProps = {
	temperature: number;
	onChange?: (val: number) => void;
};

const LLMTemperature = ({ temperature, onChange }: TLLMTemperatureProps) => {
	const [val, setVal] = useState(temperature);
	if (temperature === undefined) return null;

	return (
		<div className="flex w-full flex-col" data-state="closed">
			<div className="flex items-center">
				<label className="block text-xs font-medium text-gray-900 dark:text-white">
					Temperature
				</label>
				<span className="isolate text-xs text-white ml-auto sm:text-sm sm:leading-5">
					{val}
				</span>
			</div>
			<div className="pb-4 pt-2">
				<Slider.Root
					className="relative flex items-center select-none touch-none w-full h-5"
					defaultValue={[temperature ?? 0]}
					min={0}
					max={1}
					step={0.1}
					onValueChange={(val) => setVal(val[0])}
					onValueCommit={(val) => onChange?.(val[0])}
				>
					<Slider.Track className="bg-blackA10 relative grow rounded-full h-[3px]">
						<Slider.Range className="absolute bg-white rounded-full h-full" />
					</Slider.Track>
					<Slider.Thumb
						className="block w-5 h-5 bg-white rounded-[10px] focus:outline-none"
						aria-label="Volume"
					/>
				</Slider.Root>
			</div>
		</div>
	);
};

type TLLMDelimiterProps = {
	delimiter?: string;
	onChange: (val: string) => void;
};

const LLMDelimiter = ({ delimiter, onChange }: TLLMDelimiterProps) => {
	return (
		<div className="w-full">
			<div className="grid grid-cols-[auto,1fr] items-center gap-2">
				<label
					className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white text-xs"
					htmlFor=""
				>
					Delimiter =
				</label>
				<input
					type="text"
					defaultValue={delimiter}
					onChange={(e) => onChange(e.target.value)}
					className="block h-9 w-full  border-0 border-b p-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-zinc-600 focus:ring-0 dark:border-white/10 dark:bg-transparent dark:text-white dark:focus:border-zinc-600 dark:focus:outline-0 sm:leading-5"
					placeholder="Enter a value.."
				/>
			</div>
		</div>
	);
};

