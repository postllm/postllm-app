import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { DocumentsBuilder } from "../Playground/DocumentsBuilder";
import { VariablesBuilder } from "../Playground/VariablesBuilder";

export const ChatSideArea = () => {
	const { templateId, collectionId, chatId } = useParams();
	const utils = trpc.useContext();
	const { data: chat } = trpc.chats.get.useQuery(
		{
			id: chatId as string,
		},
		{ enabled: !!chatId },
	);
	const { mutateAsync: updateChat } = trpc.chats.update.useMutation();

	const onFilesChange = useCallback(
		async (fileId: string) => {
			if (!chat) return;

			const list = [...chat.fileIds] || [];
			if (list.includes(fileId)) list.splice(list.indexOf(fileId), 1);
			else list.push(fileId);

			await updateChat({
				...chat,
				fileIds: list,
			});
			utils.chats.get.invalidate({ id: chatId });
		},
		[chat],
	);

	const onChatUpdate = useCallback(
		async (patch: Record<any, any>) => {
			// @ts-ignore
			await updateChat({
				...chat,
				...patch,
			});
			utils.chats.get.invalidate({ id: chatId });
		},
		[chat],
	);

	return (
		<div className="grid grid-rows-[minmax(0,1fr),auto] !overflow-auto border-r border-white/10 min-w-[350px] h-screen">
			<div className="overflow-y-auto pt-2 mb-[80px]">
				<div>
					{chat && (
						<VariablesBuilder
							entity={chat}
							onUpdateEntity={onChatUpdate}
							messages={chat.messages}
						/>
					)}
					<DocumentsBuilder
						collectionId={collectionId!}
						workspaceId={chat?.workspaceId!}
						fileIds={chat?.fileIds || []}
						onToggleFile={onFilesChange}
					/>
				</div>
			</div>
		</div>
	);
};

