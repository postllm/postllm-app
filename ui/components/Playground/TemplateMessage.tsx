import {
	Cross1Icon,
	EraserIcon,
	LockClosedIcon,
	MagicWandIcon,
	ReloadIcon,
} from "@radix-ui/react-icons";
import { PromptTemplate } from "langchain";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { TVariables } from "ui/@types";
import { trpc } from "../../utils/trpc";
import useAutosizeTextArea from "../../utils/useAutosizeTextArea";
import { Button, CopyButton, IconButton } from "../Shared/Button";

type TTemplateMessageProps = {
	role: string;
	message: string;
	variables: TVariables;
	light?: boolean;
	onRemove?: () => void;
	onRefresh?: () => void;
	onNewVersion?: (prompt?: string) => void;
	enableGenerate?: boolean;
};

export const TemplateMessage = ({
	role,
	message,
	variables,
	light,
	onRefresh,
	onRemove,
	onNewVersion,
	enableGenerate = false,
}: TTemplateMessageProps) => {
	const [value, setValue] = useState<string>("");
	const [promptState, setPromptState] = useState<"loading" | "ready">();
	const textAreaRef = useRef<HTMLTextAreaElement>(null);
	useAutosizeTextArea(textAreaRef.current, value);

	const { data: hasLicense } = trpc.config.hasLicense.useQuery();
	const { mutateAsync: genPromptCandidates } =
		trpc.llm.genPromptCandidates.useMutation();

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

	const onGenerateNewPrompt = useCallback(async () => {
		if (!text) return;
		if (promptState === "loading") return;

		if (promptState === "ready") {
			// Keep the prompt
			console.log("Keep the prompt", value, onNewVersion);

			onNewVersion?.(value);
			setPromptState(undefined);
			return;
		}

		setPromptState("loading");
		const res = await genPromptCandidates({ text, count: 1 });
		if (res.text) {
			setValue(res.text);
			setPromptState("ready");
		} else {
			setPromptState(undefined);
		}
	}, [promptState, text, onNewVersion, genPromptCandidates]);

	return (
		<div
			key={message}
			className="first:border-0 border-t dark:border-white/10 relative"
		>
			<div
				className={twMerge(
					"group grid grid-cols-[110px,1fr,auto] items-center justify-center px-6 py-6 first:py-10",
					light ? "" : "bg-gray-100 dark:bg-gray-700/20",
				)}
			>
				<div className="flex h-full translate-y-[3px] items-start">
					<Button
						text={role}
						className={twMerge(
							"cursor-not-allowed ",
							onRefresh && onRemove ? "group-hover:hidden" : "",
						)}
					/>
					<div
						className={twMerge(
							"gap-2 ",
							onRefresh && onRemove
								? "hidden group-hover:flex"
								: "flex",
						)}
					>
						{onRefresh && (
							<IconButton
								onClick={onRefresh}
								leftIcon={
									<ReloadIcon className="w-3 h-3 text-xs" />
								}
							/>
						)}
						{onRemove && (
							<IconButton
								onClick={onRemove}
								leftIcon={
									<Cross1Icon className="w-3 h-3 text-xs" />
								}
							/>
						)}
					</div>
				</div>
				<div className="mt-1 grid">
					<p className="h-auto text-white resize-none overflow-auto whitespace-pre-wrap bg-transparent text-transparent caret-black outline-none disabled:bg-transparent dark:caret-gray-400">
						{value}
					</p>
				</div>
				<div className="flex gap-2 absolute top-2 right-4">
					{promptState === "ready" && (
						<Button
							text="Cancel"
							onClick={() => {
								setValue(message);
								setPromptState(undefined);
							}}
							leftIcon={
								<EraserIcon className="w-3 h-3 text-xs" />
							}
							className="hidden group-hover:flex"
						/>
					)}
					{enableGenerate && (
						<Button
							secondary
							disabled={!hasLicense || promptState === "loading"}
							text={
								promptState === "loading"
									? "Generating"
									: promptState === "ready"
									? "Keep?"
									: "Improve prompt"
							}
							leftIcon={
								<MagicWandIcon className="w-3 h-3 text-xs" />
							}
							rightIcon={
								!hasLicense ?? (
									<LockClosedIcon className="w-3 h-3 text-xs" />
								)
							}
							className="hidden group-hover:flex"
							tooltip={`Generate a new prompt ${
								hasLicense ? "" : "(requires a license)"
							}`}
							onClick={onGenerateNewPrompt}
						/>
					)}
					<CopyButton
						text={value}
						className="hidden group-hover:flex"
					/>
				</div>
			</div>
		</div>
	);
};

