import {
	CaretSortIcon,
	FileTextIcon,
	PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { Button, IconButton } from "../Shared/Button";
import { Dropdown } from "../Shared/Dropdown";
import { TemplateMessage } from "./TemplateMessage";
import { TemplateViewer } from "./TemplateViewer";

export const MainArea = () => {
	const { templateId, versionId } = useParams();
	const [messages, setMessages] = useState<any[]>([]);
	const [typing, setTyping] = useState<string>("");
	const [start, setStart] = useState<boolean>(false);
	useHotkeys("mod+Enter", () => setStart(true), [start]);
	const { data: template } = trpc.templates.get.useQuery(
		{
			id: templateId as string,
		},
		{ enabled: !!templateId },
	);

	const { mutateAsync: createChat } = trpc.chats.create.useMutation();

	trpc.llm.submit.useSubscription(
		{
			templateId: templateId as string,
			versionId: versionId as string,
			messages,
			fileIds: template?.fileIds ?? [],
		},
		{
			enabled: start,
			onStarted() {
				setTyping("");
				setStart(false);
			},
			onError() {
				setTyping("");
				setStart(false);
				setMessages((prev) => [
					...prev,
					{ prompt: typing, role: "assistant" },
				]);
			},
			onData: (data) => {
				setTyping((prev) => prev + data);
			},
		},
	);

	const onSubmitMessage = useCallback(
		async (role: string, message: string) => {
			if (message) {
				const msg = { prompt: message, role };
				setMessages((prev) => [...prev, msg]);
			}
			setStart(true);
		},
		[],
	);

	const onCreateChat = useCallback(async () => {
		await createChat();
	}, []);

	const onRemoveMessage = useCallback((index: number) => {
		setMessages((prev) => prev.filter((_, i) => i < index));
	}, []);

	const onRefreshMessage = useCallback((index: number) => {
		onRemoveMessage(index);
		setStart(true);
	}, []);

	return (
		<div className="border-r border-white/10 w-full h-screen">
			<div className="flex flex-col relative h-screen">
				<div className="w-full relative overflow-y-auto overflow-x-hidden mb-[164px]">
					<TemplateViewer />
					{messages.map((msg, i) => (
						<TemplateMessage
							onRemove={() => onRemoveMessage(i)}
							onRefresh={() => onRefreshMessage(i)}
							key={i}
							light
							role={msg.role}
							message={msg.prompt}
							variables={{}}
						/>
					))}
					{typing && (
						<TemplateMessage
							light
							role="assistant"
							message={typing}
							variables={{}}
						/>
					)}
				</div>
				<div className="flex absolute w-full bottom-[67px] z-10">
					<SubmitTemplateMessage
						onSubmit={onSubmitMessage}
						onCreateChat={onCreateChat}
					/>
				</div>
			</div>
		</div>
	);
};

const OPTIONS = [
	{ key: "system", value: "System" },
	{ key: "user", value: "User" },
	{ key: "assistant", value: "Assistant" },
];

type TSubmitTemplateMessageProps = {
	onSubmit: (role: string, message: string) => void;
	onCreateChat?: () => void;
};

const SubmitTemplateMessage = ({
	onSubmit,
	onCreateChat,
}: TSubmitTemplateMessageProps) => {
	const [role, setRole] = useState<string>("user");
	const [message, setMessage] = useState<string>("");
	useHotkeys("mod+Enter", () => onButtonClick(), [message, role], {
		enableOnFormTags: true,
	});

	const onButtonClick = useCallback(() => {
		onSubmit(role, message);
		setMessage("");
	}, [message, onSubmit, role]);

	return (
		<div className="border-b dark:border-white/10 w-full">
			<div className="px-6 py-6 cursor-not-allowed bg-gray-100 dark:bg-gray-700/20">
				<div className="flex h-full translate-y-[3px] items-start">
					<Dropdown
						onChange={(e) => setRole(e)}
						label={
							OPTIONS.find((option) => option.key === role)
								?.value ?? "Select a value"
						}
						// onChange={onChange}
						options={OPTIONS}
						rightIcon={<CaretSortIcon />}
					/>
					<textarea
						className="h-auto ml-4 w-full text-white resize-none overflow-hidden whitespace-pre-wrap bg-transparent text-transparent caret-black outline-none disabled:bg-transparent dark:caret-gray-400"
						rows={2}
						placeholder="Add your message (optional)"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
					/>
					<div className="flex gap-2">
						<Button
							primary
							onClick={onButtonClick}
							text="Submit"
							leftIcon={<PaperPlaneIcon className="w-3 h-3" />}
						/>
						{onCreateChat && (
							<IconButton
								onClick={onCreateChat}
								leftIcon={<FileTextIcon className="w-3 h-3" />}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

