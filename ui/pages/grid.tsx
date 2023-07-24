import { ChevronDownIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GridSideArea } from "../components/Grid/GridSideArea";
import { GridTable } from "../components/Grid/GridTable";
import { Layout } from "../components/Layout";
import { Button } from "../components/Shared/Button";
import { Dropdown } from "../components/Shared/Dropdown";
import { timeAgo } from "../utils/timeAgo";
import { trpc } from "../utils/trpc";

export const GridPage = () => {
	const { gridId, collectionId } = useParams();
	const utils = trpc.useContext();
	const [selectedHistory, setSelectedHistory] = useState<string | null>(null);
	const { data: grid } = trpc.grids.get.useQuery({ id: gridId as string });
	const { mutateAsync: execute } = trpc.grids.execute.useMutation();

	useEffect(() => {
		if (!grid) return;
		if (selectedHistory) return;
		setSelectedHistory(grid?.history[0]?._id ?? null);
	}, [grid]);


	const onExecute = useCallback(async () => {
		const historyId = await execute({ id: gridId as string });
		utils.grids.get.invalidate({ id: gridId as string });		
		setSelectedHistory(historyId);
	}, [gridId, execute]);

	return (
		<Layout>
			<div className="relative flex flex-row w-full h-screen">
				<div className="border-r border-white/10 w-full overflow-auto">
					<div className="flex flex-col relative">
						<div className="py-2 flex items-center justify-center gap-x-2.5 text-xs leading-5 text-gray-400 hover:text-white  ml-0 bg-gray-700/20">
							<div className="text-white text-base font-bold ml-8">{grid?.name}</div>
							<div className="ml-auto mr-4 flex gap-4">
								<Dropdown 
									label={`History (${timeAgo(grid?.history.find((h) => h._id === selectedHistory)?.createdAt ?? 0)})`} 
									rightIcon={<ChevronDownIcon />} 
									options={grid?.history.reverse().map((h) => ({key: h._id, value: timeAgo(h.createdAt)})) ?? []} 
									onChange={(id) => setSelectedHistory(id)}
								/>
								<Button primary onClick={onExecute} text="Execute" leftIcon={<PaperPlaneIcon className="w-3 h-3" />} />
							</div>
						</div>
					</div>
					{selectedHistory && <GridTable collectionId={collectionId!} historyId={selectedHistory} /> }
				</div>
				<GridSideArea />
			</div>
		</Layout>
	);
};

