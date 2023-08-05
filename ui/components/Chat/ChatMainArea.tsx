import {
	CaretSortIcon,
	FileTextIcon,
	PaperPlaneIcon,
} from "@radix-ui/react-icons";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate, useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { TemplateMessage } from "../Playground/TemplateMessage";
import { Button, IconButton } from "../Shared/Button";
import { Dropdown } from "../Shared/Dropdown";

type TMessage = {
	_id: string;
	role: "user" | "system" | "assistant" | string;
	prompt: string;
	inputVariables: string[];
};

export const ChatMainArea = () => {
	const { chatId } = useParams();
	const navigate = useNavigate();
	const utils = trpc.useContext();
	const [messages, setMessages] = useState<TMessage[]>([]);
	const [typing, setTyping] = useState<string>("");
	const [start, setStart] = useState<boolean>(false);
	useHotkeys("mod+Enter", () => setStart(true), [start]);
	const { data: chat } = trpc.chats.get.useQuery(
		{
			id: chatId as string,
		},
		{ enabled: !!chatId },
	);
	const { mutateAsync: updateChat } = trpc.chats.update.useMutation({
		onSuccess: () => utils.chats.get.invalidate({ id: chatId }),
	});
	const { mutateAsync: addNewMessage } = trpc.chats.addNewMessage.useMutation(
		{ onSuccess: () => utils.chats.get.invalidate({ id: chatId }) },
	);

	useEffect(() => {
		if (!chat) return;
		setMessages(chat.messages ?? []);
	}, [chat?.modifiedAt]);

	trpc.llm.submit.useSubscription(
		{
			messages,
			fileIds: chat?.fileIds ?? [],
			collectionId: chat?.collectionId!,
			workspaceId: chat?.workspaceId!,
		},
		{
			enabled: start,
			onStarted() {
				setTyping("");
				setStart(false);
			},
			onError() {
				setStart(false);
				addNewMessage({
					id: chat?._id!,
					role: "assistant",
					prompt: typing,
				});
				setTyping("");
			},
			onData: (data) => {
				setTyping((prev) => prev + data);
			},
		},
	);

	const onSubmitMessage = useCallback(
		async (role: string, message: string) => {
			if (message) {
				const msg = {
					_id: nanoid(),
					prompt: message,
					role,
					inputVariables: [],
				};
				await addNewMessage({
					id: chat?._id!,
					// @ts-ignore
					role,
					prompt: msg.prompt,
				});
				setMessages((prev) => [...prev, msg]);
			}
			setStart(true);
		},
		[chat?.modifiedAt],
	);

	const onRemoveMessage = useCallback(
		async (index: number) => {
			return await updateChat({
				...chat,
				// @ts-ignore
				messages: messages.filter((_, i) => i < index),
			});
		},
		[chat?.modifiedAt, messages],
	);

	const onRefreshMessage = useCallback(
		async (index: number) => {
			await onRemoveMessage(index);
			setStart(true);
		},
		[chat?.modifiedAt, messages],
	);

	return (
		<div className="border-r border-white/10 w-full h-screen">
			<div className="flex flex-col relative h-screen">
				<div className="w-full relative overflow-y-auto overflow-x-hidden mb-[164px]">
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
					<SubmitTemplateMessage onSubmit={onSubmitMessage} />
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

