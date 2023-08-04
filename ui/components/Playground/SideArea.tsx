import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { DocumentsBuilder } from "./DocumentsBuilder";
import { TemplateBuilder } from "./TemplateBuilder";
import { VariablesBuilder } from "./VariablesBuilder";

export const SideArea = () => {
	const { templateId, collectionId } = useParams();
	const utils = trpc.useContext();
	const { data: template } = trpc.templates.get.useQuery(
		{
			id: templateId as string,
		},
		{ enabled: !!templateId },
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

	return (
		<div className="grid grid-rows-[minmax(0,1fr),auto] !overflow-auto border-r border-white/10 min-w-[350px] h-screen">
			<div className="overflow-y-auto pt-2 mb-[80px]">
				<div>
					<TemplateBuilder />
					<VariablesBuilder />
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

