import { CaretDownIcon, PlusIcon } from "@radix-ui/react-icons";
import { nanoid } from "nanoid";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { trpc } from "../../utils/trpc";
import { CreateGridModal } from "../Modals/CreateGridModal";
import { CreatePromptTemplate } from "../Modals/CreatePromptTemplateModal";
import { Dropdown } from "./Dropdown";

export const TopNavBar = () => {
	const { collectionId, workspaceId } = useParams();
	const navigate = useNavigate();
	const { mutateAsync: createChat } = trpc.chats.create.useMutation();
	const [showModal, setShowModal] = useState<
		"prompt" | "grid" | "chat" | null
	>();

	const onDropdownChange = useCallback(
		async (value: any) => {
			if (!collectionId || !workspaceId) return;

			if (value === "chat") {
				const chat = await createChat({
					collectionId: collectionId,
					workspaceId: workspaceId,
					messages: [],
					fileIds: [],
					_id: nanoid(),
					type: "Chat",
					modifiedAt: Date.now(),
					createdAt: Date.now(),
					name: `New Chat`,
					settings: {},
				});

				navigate(
					`/workspaces/${chat.workspaceId}/dashboard/${chat.collectionId}/chats/${chat._id}`,
				);
				return;
			}

			setShowModal(value);
		},
		[collectionId, workspaceId],
	);

	return (
		<div
			style={{
				// @ts-ignore
				"--bg-opacity-light": 0.5,
				"--bg-opacity-dark": 0.2,
			}}
			className={twMerge(
				"relative",
				"z-50 flex h-12 gap-12 transition",
				"backdrop-blur-sm dark:backdrop-blur",
				"bg-white/[var(--bg-opacity-light)] dark:bg-zinc-900/[var(--bg-opacity-dark)]",
			)}
		>
			<div
				className={twMerge(
					"absolute inset-x-0 top-full h-px transition",
					"bg-zinc-900/7.5 dark:bg-white/7.5 bg-red-500",
				)}
			/>
			<div className="flex h-12 flex-row justify-center items-center w-full">
				<h1 className="text-white justify-center items-center flex gap-3 ml-2">
					<span className="font-bold">PostLLM</span>
				</h1>
				<div className="flex ml-auto mr-4 gap-4">
					<Dropdown
						primary={true}
						label="Create"
						leftIcon={<PlusIcon />}
						rightIcon={<CaretDownIcon />}
						onChange={onDropdownChange}
						options={[
							{ key: "prompt", value: "Prompt Template" },
							{ key: "grid", value: "Compare Prompts" },
							{ key: "chat", value: "Chat" },
						]}
					/>
				</div>
			</div>
			{showModal === "prompt" && (
				<CreatePromptTemplate open={!!showModal} />
			)}
			{showModal === "grid" && <CreateGridModal open={!!showModal} />}
		</div>
	);
};

