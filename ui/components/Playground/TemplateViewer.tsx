import {
	CaretSortIcon,
	CheckCircledIcon,
	CounterClockwiseClockIcon,
	PlusIcon,
} from "@radix-ui/react-icons";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { trpc } from "../../utils/trpc";
import { Button } from "../Shared/Button";
import { Dropdown } from "../Shared/Dropdown";
import { TemplateMessage } from "./TemplateMessage";

export const TemplateViewer = () => {
	const { templateId, workspaceId, collectionId, versionId } = useParams();
	const navigate = useNavigate();
	const utils = trpc.useContext();
	const { data: template } = trpc.templates.get.useQuery({
		id: templateId as string,
	});
	const { data: version } = trpc.templates.getVersion.useQuery(
		{
			id: templateId as string,
			versionId: versionId as string,
		},
		{ enabled: !!versionId },
	);
	const { mutateAsync: saveTemplate } = trpc.templates.update.useMutation({
		onSuccess: () => {
			utils.templates.get.invalidate({ id: templateId });
			utils.templates.getVersion.invalidate({
				id: templateId,
				versionId,
			});
		},
	});

	const onChangeDefaultVersion = useCallback(
		async (e: MouseEvent, versionId: string) => {
			e.preventDefault();
			e.stopPropagation();

			if (!template) return;

			saveTemplate({ ...template, defaultVersionId: versionId });
		},
		[template, saveTemplate],
	);

	const onNewVersion = useCallback(
		async (e: MouseEvent | null, prompt?: string) => {
			if (e?.preventDefault) e.preventDefault();
			if (!template) return;
			if (!version) return;

			const copy = structuredClone(version);
			if (!copy) return;

			copy._id = nanoid();
			copy.messages = copy.messages.map((m) => ({
				...m,
				_id: nanoid(),
				prompt: prompt ?? m.prompt,
			}));

			await saveTemplate({
				...template,
				versions: [copy, ...template.versions],
			});

			navigate(
				`/workspaces/${workspaceId}/dashboard/${collectionId}/templates/${templateId}/${copy._id}`,
			);
		},
		[
			template,
			version,
			saveTemplate,
			navigate,
			workspaceId,
			collectionId,
			templateId,
		],
	);

	const versionCount = template?.versions.length ?? 0;
	const versionIndex = (template?.versions ?? []).findIndex(
		(x) => x._id === version?._id,
	);
	let versionSuffix =
		versionIndex === 0 ? "Latest" : versionCount - versionIndex;

	return (
		<div className="relative">
			<div className="py-2 flex items-center justify-center gap-x-2.5 text-xs leading-5 text-gray-400 hover:text-white  ml-0 bg-gray-700/20">
				<div className="text-white text-base font-bold ml-4">
					{template?.name}
				</div>
				<div className="ml-auto mr-4 flex gap-4">
					<Dropdown
						label={`Version: ${versionSuffix}`}
						rightIcon={<CaretSortIcon />}
						leftIcon={<CounterClockwiseClockIcon />}
						options={
							template?.versions.map((x, i) => ({
								value: (
									<div
										key={x._id}
										className="flex w-full group min-w-[200px] items-center justify-center"
									>
										<span>{`Version ${
											versionCount - i
										}`}</span>
										<Button
											onClick={(e) =>
												onChangeDefaultVersion(e, x._id)
											}
											className={twMerge(
												"text-[10px] ml-auto group-hover:opacity-100",
												x._id ===
													template.defaultVersionId
													? ""
													: "opacity-0",
											)}
											disabled={
												x._id ===
												template.defaultVersionId
											}
											text={
												x._id ===
												template.defaultVersionId
													? "Default"
													: "Set as default"
											}
										/>
									</div>
								),
								key: x._id,
							})) ?? []
						}
						onChange={(id) =>
							navigate(
								`/workspaces/${workspaceId}/dashboard/${collectionId}/templates/${templateId}/${id}`,
							)
						}
					/>
					<Button
						text="Create new version"
						leftIcon={<PlusIcon className="w-4 h-4" />}
						onClick={onNewVersion}
						className=" hover:text-emerald-500 flex"
					/>
					<Button
						text="Saved"
						leftIcon={<CheckCircledIcon className="w-4 h-4" />}
						onClick={onNewVersion}
						className=" cursor-not-allowed"
					/>
				</div>
			</div>
			<div className="group max-h-[calc(100vh-200px)] overflow-auto relative flex flex-col hover:bg-emerald-500/5 transition-colors">
				{version &&
					version.messages.map(
						(
							message: {
								role: string;
								prompt: string;
								_id: string;
							},
							index,
						) => (
							<TemplateMessage
								key={message._id}
								role={message.role}
								message={message.prompt}
								variables={template?.variables ?? {}}
								onNewVersion={(s) => onNewVersion(null, s)}
								enableGenerate={index === 0}
							/>
						),
					)}
			</div>
		</div>
	);
};

