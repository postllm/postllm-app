
import { Cross1Icon, ReloadIcon } from "@radix-ui/react-icons";
import { PromptTemplate } from "langchain";
import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { TVariables } from "ui/@types";
import useAutosizeTextArea from "../../utils/useAutosizeTextArea";
import { Button, CopyButton, IconButton } from "../Shared/Button";

type TTemplateMessageProps = {
	role: string;
	message: string;
	variables: TVariables;
	light?: boolean;
	onRemove?: () => void;
	onRefresh?: () => void;

};

export const TemplateMessage = ({
	role,
	message,
	variables,
	light,
	onRefresh,
	onRemove
}: TTemplateMessageProps) => {
	const [value, setValue] = useState<string>("");
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	useAutosizeTextArea(textAreaRef.current, value);

	const text = useMemo(() => {
		let txt = message;
		for (const key of Object.keys(variables)) {
			txt = txt.replaceAll(`{{${key}}}`, `{${key}}`);
		}

		return txt;
	}, [message, variables]);

	useEffect(() => {
		const func = async () => {
			try {
			const prompt = new PromptTemplate({
				template: text,
				inputVariables: Object.keys(variables),
			});

			const val = await prompt.format(variables);
			setValue(val);
			} catch (_e) {
				setValue(text);
			} 
		};
		func();
	}, [text, variables]);

	return (
		<div
			key={message}
			className="first:border-0 border-t dark:border-white/10 relative"
		>
			<div className={twMerge("group grid grid-cols-[110px,1fr,auto] items-center justify-center px-6 py-6", light ? '': 'bg-gray-100 dark:bg-gray-700/20')}>
				<div className="flex h-full translate-y-[3px] items-start">
					<Button text={role} className={twMerge("cursor-not-allowed ", onRefresh && onRemove ? 'group-hover:hidden' : '')} />
					<div className={twMerge("gap-2 ", onRefresh && onRemove ? 'hidden group-hover:flex' : 'flex')}>					
						{onRefresh && <IconButton onClick={onRefresh} leftIcon={<ReloadIcon className="w-3 h-3 text-xs" />} /> }
						{onRemove && <IconButton onClick={onRemove} leftIcon={<Cross1Icon className="w-3 h-3 text-xs" />} /> }
					</div>
				</div>
				<div className="mt-1 grid">
					<p
						className="h-auto text-white resize-none overflow-auto whitespace-pre-wrap bg-transparent text-transparent caret-black outline-none disabled:bg-transparent dark:caret-gray-400"
					>{value}</p>
				</div>
				<CopyButton text={value} className="absolute top-2 right-4 hidden group-hover:flex" />
			</div>
		</div>
	);
};

