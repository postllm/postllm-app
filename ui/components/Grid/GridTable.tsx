import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";

type TGridTableProps = {
	historyId: string;
	collectionId: string;
};

export const GridTable = ({ collectionId, historyId }: TGridTableProps) => {
	const { gridId } = useParams();
	const { data: grid } = trpc.grids.get.useQuery({ id: gridId as string });
	const { data: templates } = trpc.templates.all.useQuery({ collectionId });

	const run = grid?.history.find((h) => h._id === historyId);

	if (!run) return null;

	return (
		<div key={run._id}>
			<table className="divide-y divide-gray-100/10 w-full text-white">
				<thead>
					<tr className="divide-x divide-gray-100/10">
						<th
							scope="col"
							className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold sm:pl-0 !w-[120px]"
						></th>
						{run.sets.map((set, i) => (
							<th
								key={set._id}
								className="px-4 py-3.5 text-sm text-center font-semibold"
							>
								{set.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100/10">
					{run.templates.map((tmpl, i) => {
						const template = templates?.find(
							(template) => template._id === tmpl.templateId,
						);
						const version =
							template?.versions.findIndex(
								(v) => v._id === tmpl.versionId,
							) ?? 0;
						const versionCount = template?.versions.length ?? 0;

						return (
							<tr
								key={tmpl._id}
								className="divide-x divide-gray-100/10"
							>
								<td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium sm:pl-0 !w-[120px]">
									{template?.name}{" "}
									{version === 0
										? "(Latest)"
										: `(v${versionCount - version})`}
								</td>
								{run.sets.map((set, i) => (
									<td className="group relative whitespace-pre-line px-4 py-8 text-sm">
										<GridCell
											key={tmpl._id}
											result={
												run.results[
													`${tmpl.versionId}_${set._id}`
												]
											}
											setId={set._id}
											gridId={grid?._id!}
											historyId={run._id}
											versionId={tmpl.versionId}
											templateId={tmpl.templateId}
											variables={set?.variables ?? {}}
											llm={template?.settings ?? {}}
										/>
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

type TGridCellProps = {
	versionId: string;
	templateId: string;
	setId: string;
	historyId: string;
	gridId: string;
	variables: Record<string, any>;
	llm: Record<string, any>;
	result?: string;
};

const GridCell = ({
	templateId,
	result,
	gridId,
	setId,
	historyId,
	versionId,
	variables,
	llm,
}: TGridCellProps) => {
	const [enabled, setEnabled] = useState<boolean>(false);
	const [typing, setTyping] = useState<string>("");
	const { mutate: addGridResult } = trpc.grids.addGridResult.useMutation();
	const { data: grid } = trpc.grids.get.useQuery({
		id: gridId as string,
	});

	console.log(grid);

	trpc.llm.submit.useSubscription(
		{
			templateId,
			versionId,
			variables,
			llm,
			messages: [],
			fileIds: grid?.fileIds ?? [],
			collectionId: grid?.collectionId!,
			workspaceId: grid?.workspaceId!,
		},
		{
			enabled,
			onStarted() {
				setTyping("");
			},
			onError() {
				setEnabled(false);
				addGridResult({
					versionId,
					setId,
					historyId,
					gridId,
					result: typing,
				});
			},
			onData: (data) => {
				setTyping((prev) => prev + data);
			},
		},
	);

	useEffect(() => {
		if (result) {
			setTyping(result);
		} else {
			setEnabled(true);
		}
	}, []);

	return <div className="flex flex-col text-white">{typing}</div>;
};

