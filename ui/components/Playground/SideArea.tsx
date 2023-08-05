import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { DocumentsBuilder } from "./DocumentsBuilder";
import { TemplateBuilder } from "./TemplateBuilder";
import { VariablesBuilder } from "./VariablesBuilder";

export const SideArea = () => {
	const { templateId, versionId, collectionId } = useParams();
	const utils = trpc.useContext();
	const { data: template } = trpc.templates.get.useQuery(
		{
			id: templateId as string,
		},
		{ enabled: !!templateId },
	);
	const { data: version } = trpc.templates.getVersion.useQuery(
		{
			id: templateId as string,
			versionId: versionId as string,
		},
		{ enabled: !!templateId && !!versionId },
	);
	const { mutate: saveTemplate } = trpc.templates.update.useMutation({
		onSuccess: () => {
			utils.templates.get.invalidate({ id: templateId });
		},
	});

	const onFilesChange = useCallback(
		async (fileId: string) => {
			if (!template) return;

			const list = [...template.fileIds] || [];
			if (list.includes(fileId)) list.splice(list.indexOf(fileId), 1);
			else list.push(fileId);

			await saveTemplate({ ...template, fileIds: list });
			utils.files.all.invalidate({ collectionId });
		},
		[template, templateId, saveTemplate],
	);

	const onChatUpdate = useCallback(
		async (patch: Record<any, any>) => {
			// @ts-ignore
			await saveTemplate({
				...template,
				...patch,
			});
			utils.chats.get.invalidate({ id: templateId });
			utils.templates.getVersion.invalidate({
				id: templateId,
				versionId,
			});
		},
		[template, saveTemplate, versionId],
	);

	return (
		<div className="grid grid-rows-[minmax(0,1fr),auto] !overflow-auto border-r border-white/10 min-w-[350px] h-screen">
			<div className="overflow-y-auto pt-2 mb-[80px]">
				<div>
					<TemplateBuilder />
					{template && version && (
						<VariablesBuilder
							entity={template}
							onUpdateEntity={onChatUpdate}
							messages={version.messages}
						/>
					)}
					<DocumentsBuilder
						collectionId={collectionId!}
						workspaceId={template?.workspaceId!}
						fileIds={template?.fileIds || []}
						onToggleFile={onFilesChange}
					/>
				</div>
			</div>
		</div>
	);
};

