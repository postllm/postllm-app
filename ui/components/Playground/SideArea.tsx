import { TemplateBuilder } from "./TemplateBuilder";
import { VariablesBuilder } from "./VariablesBuilder";

export const SideArea = () => {
	return (
		<div className="grid grid-rows-[minmax(0,1fr),auto] !overflow-auto border-r border-white/10 min-w-[350px] h-screen">
			<div className="overflow-y-auto pt-2">
				<div>
					<TemplateBuilder />
					<VariablesBuilder />
				</div>
			</div>
		</div>
	);
};

