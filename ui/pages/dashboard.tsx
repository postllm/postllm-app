import {
	BackpackIcon,
	BookmarkFilledIcon,
	ClockIcon,
	DotsVerticalIcon,
	FileTextIcon,
	PlusCircledIcon,
} from "@radix-ui/react-icons";
import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { Layout } from "../components/Layout";
import { CreateCollectionModal } from "../components/Modals/CreateCollectionModal";
import { RenameCollectionModal } from "../components/Modals/RenameCollectionModal";
import { WarningBanner } from "../components/Shared/Banner";
import { Dropdown } from "../components/Shared/Dropdown";
import EntityIcon from "../components/Shared/EntityIcon";
import { SectionTitle } from "../components/Shared/SectionTitle";
import { timeAgo } from "../utils/timeAgo";
import { trpc } from "../utils/trpc";

export const DashboardPage = () => {
	const { collectionId, workspaceId } = useParams();
	const utils = trpc.useContext();
	const [filter, setFilter] = useState<
		"Template" | "Grid" | "Chat" | "File" | null
	>();
	const [showNewCollection, setShowNewCollection] = useState(false);
	const [showRenameCollection, setShowRenameCollection] = useState<
		string | null
	>("");
	const { data: config } = trpc.config.get.useQuery();
	const { data: templates } = trpc.templates.all.useQuery({
		collectionId: `${collectionId}`,
	});
	const { data: grids } = trpc.grids.all.useQuery({
		collectionId: `${collectionId}`,
	});
	const { data: collections } = trpc.collections.all.useQuery({
		workspaceId: `${workspaceId}`,
	});
	const { data: files } = trpc.files.all.useQuery({
		collectionId: `${collectionId}`,
	});
	const { data: collection } = trpc.collections.get.useQuery({
		id: `${collectionId}`,
	});
	const { mutateAsync: deletePrompt } = trpc.templates.delete.useMutation();
	const { mutateAsync: clonePrompt } = trpc.templates.clone.useMutation();
	const { mutateAsync: deleteFile } = trpc.files.delete.useMutation();
	const { mutateAsync: deleteGrid } = trpc.grids.delete.useMutation();
	const { mutateAsync: deleteCollection } =
		trpc.collections.delete.useMutation();

	const onHandleOption = useCallback(
		async (type: string, action: string, id: string) => {
			if (action === "delete") {
				if (type === "Template") await deletePrompt({ id });
				if (type === "Grid") await deleteGrid({ id });
				if (type === "File") await deleteFile({ id });
			}

			if (action === "clone") {
				if (type === "Template") await clonePrompt({ id });
			}
			utils.templates.all.invalidate();
			utils.grids.all.invalidate();
			utils.files.all.invalidate();
		},
		[clonePrompt, deletePrompt, utils],
	);

	const onCollectionAction = useCallback(
		async (collectionId: string, action: string) => {
			setShowRenameCollection(null);

			if (action === "delete") {
				if (confirm("Are you sure you want to delete this space?")) {
					await deleteCollection({
						id: collectionId,
					});
					utils.collections.all.invalidate();
				}
				return;
			}

			if (action === "rename") {
				console.log(collectionId);
				setShowRenameCollection(collectionId);
			}
		},
		[collection],
	);

	const entities = [
		...(templates ?? []),
		...(grids ?? []),
		...(files ?? []),
	].filter((e) => {
		if (!filter) return true;
		if (filter) return e.type === filter;
	});

	return (
		<Layout>
			<div className="">
				<div className="border-r border-white/10 min-w-[300px] h-screen">
					<div className="pt-2 min-h-[500px]">
						{/* Collections */}
						<SectionTitle
							title="Spaces"
							leftIcon={
								<BackpackIcon className="font-semibold leading-6 text-emerald-500 dark:text-emerald-400" />
							}
							actionIcon={<PlusCircledIcon />}
							onActionClick={() => setShowNewCollection(true)}
						/>
						<div className="relative mt-3 pl-2">
							<ul className="overflow-y-auto dark:border dark:border-transparent dark:border-l-white/5">
								{collections?.map((col) => (
									<NavLink
										key={col._id}
										href={`/workspaces/${workspaceId}/dashboard/${col._id}`}
										active={collection?._id === col._id}
										className="w-full"
									>
										<div className="flex w-full">
											<span>{col.name}</span>
											{col._id === collectionId && (
												<span className="ml-auto">
													<Dropdown
														leftIcon={
															<DotsVerticalIcon className="w-2 h-2" />
														}
														options={[
															{
																key: "rename",
																value: "Rename",
															},
															{
																key: "delete",
																value: "Delete",
															},
														]}
														label={""}
														onChange={(key) =>
															onCollectionAction(
																col._id,
																key,
															)
														}
													/>
												</span>
											)}
										</div>
									</NavLink>
								))}
							</ul>
						</div>
					</div>
					{/* Documents */}
					<div className="pt-2">
						<SectionTitle
							title="Documents"
							leftIcon={
								<FileTextIcon className="font-semibold leading-6 text-emerald-500 dark:text-emerald-400" />
							}
						/>
						<div className="relative mt-3 pl-2">
							<ul className="overflow-y-auto dark:border dark:border-transparent dark:border-l-white/5">
								<NavLink
									onClick={() => setFilter(null)}
									active={!filter}
									className="text-left"
								>
									All
								</NavLink>
								<NavLink
									onClick={() => setFilter("Template")}
									active={filter === "Template"}
									className="pl-6"
								>
									<span className="flex">
										<BookmarkFilledIcon className="mr-2 text-emerald-400" />{" "}
										Prompt Templates
									</span>
								</NavLink>
								<NavLink
									onClick={() => setFilter("Grid")}
									active={filter === "Grid"}
									className="pl-6"
								>
									<span className="flex">
										<EntityIcon
											entity={{ type: "Grid" }}
											className="mr-2 "
										/>{" "}
										Compare Prompts
									</span>
								</NavLink>
								<NavLink
									onClick={() => setFilter("Chat")}
									active={filter === "Chat"}
									className="pl-6"
								>
									<span className="flex">
										<EntityIcon
											entity={{ type: "Chat" }}
											className="mr-2 "
										/>{" "}
										Chats (Coming soon)
									</span>
								</NavLink>
								<NavLink
									onClick={() => setFilter("File")}
									active={filter === "File"}
									className="pl-6"
								>
									<span className="flex">
										<EntityIcon
											entity={{ type: "File" }}
											className="mr-2 "
										/>{" "}
										Files
									</span>
								</NavLink>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div className="pt-10 mx-4  border-zinc-900/5  dark:border-white/5">
				{config && !config?.apiKeys?.openAIKey && (
					<WarningBanner text="You're OpenAI API key is missing. Make sure to add it in your Preferences!" />
				)}
				<div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
					{entities?.map((entity) => (
						<Card
							key={entity._id}
							title={entity.name}
							href={`/workspaces/${workspaceId}/dashboard/${collectionId}/${entity.type.toLowerCase()}s/${
								entity._id
							}`}
							time={entity.modifiedAt}
							icon={
								<EntityIcon
									entity={entity}
									className="mr-2 mt-[5px]"
								/>
							}
							dropdown={
								<Dropdown
									label=""
									onChange={(key: string) =>
										onHandleOption(
											entity.type,
											key,
											entity._id,
										)
									}
									options={[
										{ key: "clone", value: "Duplicate" },
										{ key: "delete", value: "Delete" },
									]}
									rightIcon={
										<DotsVerticalIcon className="w-4 h-4 text-zinc-400" />
									}
								/>
							}
						/>
					))}
				</div>
			</div>
			{showNewCollection && (
				<CreateCollectionModal open={showNewCollection} />
			)}
			{showRenameCollection && (
				<RenameCollectionModal
					collectionId={showRenameCollection}
					open={!!showRenameCollection}
				/>
			)}
		</Layout>
	);
};

type TNavLinkProps = {
	onClick?: () => void;
	active: boolean;
	children: React.ReactNode;
	className?: string;
	href?: string;
};

function NavLink({
	onClick,
	href,
	active,
	children,
	className,
}: TNavLinkProps) {
	const navigate = useNavigate();

	return (
		<button
			onClick={() => {
				onClick?.();
				if (href) navigate(href);
			}}
			aria-current={active ? "page" : undefined}
			className={twMerge(
				"w-full flex justify-between gap-2 pl-4 py-2 pr-3 text-sm transition",
				"dark:hover:border-l-emerald-500 dark:border dark:border-transparent",
				active
					? "text-zinc-900 dark:text-white dark:border-l-emerald-500 dark:bg-white/2.5"
					: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
				className,
			)}
		>
			<span className="w-full">{children}</span>
		</button>
	);
}

type TCardProps = {
	icon: React.ReactNode;
	dropdown?: React.ReactNode;
	title: string;
	href: string;
	description?: string;
	time: number;
};

function Card({ icon, title, href, time, description, dropdown }: TCardProps) {
	return (
		<Link
			to={href}
			className={twMerge(
				"group min-w-[200px] w-[200px] h-[150px] relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5",
				"dark:hover:border-emerald-500/50 dark:border dark:border-white/10 transition-all",
				"hover:cursor-pointer",
			)}
		>
			<div className="relative rounded-2xl px-4 pb-0 pt-4 overflow-hidden w-full">
				<h3
					title={title}
					className="mt-1 text-sm font-semibold leading-7 text-zinc-900 dark:text-white"
				>
					<span className="flex">
						<span>{icon}</span>
						<span className="overflow-hidden">{title}</span>
					</span>
				</h3>
				<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 truncate">
					{description}
				</p>
				<div className="flex flex-row dark:text-zinc-400 text-xs absolute bottom-1 w-full">
					<div className="flex">
						<ClockIcon className="w-4 h-4 mr-2" />
						<span>{timeAgo(time)}</span>
					</div>
					<div className="ml-auto mr-7 -mt-1">{dropdown}</div>
				</div>
			</div>
		</Link>
	);
}

