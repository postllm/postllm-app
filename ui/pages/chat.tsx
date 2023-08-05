import { useNavigate, useParams } from "react-router-dom";
import { ChatMainArea } from "../components/Chat/ChatMainArea";
import { ChatSideArea } from "../components/Chat/ChatSideArea";
import { Layout } from "../components/Layout";
import { trpc } from "../utils/trpc";

export const ChatPage = () => {
	const { workspaceId, chatId } = useParams();
	const navigate = useNavigate();
	const { data: chat } = trpc.chats.get.useQuery(
		{
			id: chatId as string,
		},
		{ enabled: !!chatId },
	);

	return (
		<Layout>
			<div className="relative flex flex-row w-full">
				<ChatMainArea />
				<ChatSideArea />
			</div>
		</Layout>
	);
};

