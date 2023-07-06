import * as Slider from "@radix-ui/react-slider";
import { useCallback, useState } from "react";
import { LLMDropdown } from "../Shared/LLMDowndown";

type TLLMParametersProps = {
	temperature: number;
	modelName: string;
	onChange: (key: string, value: any) => void;
}

export const LLMParameters = ({temperature, onChange, modelName}: TLLMParametersProps) => {
	const onModelChange = useCallback(async (modelName: string) => {
		onChange('modelName', modelName);
	}, []);

	const onTemperatureChange = useCallback(async (temperature: number) => {
		onChange('temperature', temperature);
	}, []);

	return (
		<div className="flex flex-wrap gap-3 mt-2 px-6 pb-4">
			<LLMDropdown label={modelName} onChange={onModelChange} />
			<LLMTemperature temperature={temperature} onChange={onTemperatureChange} />
		</div>
	);
};


type TLLMTemperatureProps = {
	temperature: number;
	onChange?: (val: number) => void;
};

const LLMTemperature = ({temperature, onChange}: TLLMTemperatureProps) => {
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

