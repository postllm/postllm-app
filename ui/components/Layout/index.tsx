import { GearIcon, HomeIcon, PlusIcon } from "@radix-ui/react-icons";
import { FC, ReactNode, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { CreateWorkspaceModal } from "../Modals/CreateWorkspaceModal";
import { SettingsModal } from "../Modals/SettingsModal";
import { Tooltipy } from "../Shared/Tooltipy";
import { TopNavBar } from "../Shared/TopNavBar";

export interface ILayout {
	children: ReactNode;
}

export const Layout: FC<ILayout> = ({ children }) => {
	const { workspaceId, collectionId } = useParams();
	const { data: version } = trpc.config.version.useQuery();
	const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
		useState(false);
	const [showPreferences, setShowPreferences] = useState(false);

	return (
		<div className="dark">
			<div className="bg-white antialiased dark:bg-zinc-900">
				<div className="flex h-screen w-screen flex-col overflow-hidden">
					<TopNavBar />
					<div className="select-none">
						<div className="relative flex flex-row">
							<div className="border-r border-white/10 min-w-[50px] h-screen">
								<div className="flex flex-col items-center h-full">
									<Link
										to={`/workspaces/${
											workspaceId ?? 1
										}/dashboard/${collectionId ?? 1}`}
										className="my-2 w-8 h-8 bg-white rounded m-auto text-center"
									>
										<HomeIcon className="text-black m-auto mt-2" />
									</Link>
									<Tooltipy text="New Workspace (Coming soon)">
										<button
											disabled
											onClick={() =>
												setShowCreateWorkspaceModal(
													!showCreateWorkspaceModal,
												)
											}
										>
											<PlusIcon className="text-white/50 hover:text-white transition-colors" />
										</button>
									</Tooltipy>
								</div>
							</div>
							{showCreateWorkspaceModal && (
								<CreateWorkspaceModal
									open={showCreateWorkspaceModal}
								/>
							)}
							{children}
						</div>
					</div>
					<div className="fixed text-sm px-2 bottom-0 left-0 right-0 w-full h-6 z-10 justify-center align-middle bg-zinc-900 border-t border-white/10">
						<div className="flex dark:text-zinc-400 text-[10px] gap-5">
							<div>v{version}</div>
							<button
								onClick={() =>
									setShowPreferences(!showPreferences)
								}
								className="flex gap-1 dark:text-zinc-400 text-[10px] hover:underline"
							>
								<GearIcon className="w-3 h-3 mt-1" />
								<span>Preferences</span>
							</button>
						</div>
					</div>
				</div>
			</div>
			{showPreferences && (
				<SettingsModal key={Date.now()} open={showPreferences} />
			)}
		</div>
	);
};

