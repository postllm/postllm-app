import { CaretSortIcon, CheckCircledIcon, CounterClockwiseClockIcon, PlusIcon } from "@radix-ui/react-icons";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { trpc } from "../../utils/trpc";
import { Button } from "../Shared/Button";
import { Dropdown } from "../Shared/Dropdown";
import { TemplateMessage } from "./TemplateMessage";

export const TemplateViewer = () => {
	const { templateId, workspaceId, collectionId, versionId } = useParams();
	const navigate = useNavigate();
	const utils = trpc.useContext();
	const { data: template } = trpc.templates.get.useQuery({ id: templateId as string });
	const { data: version } = trpc.templates.getVersion.useQuery({id: templateId as string, versionId: versionId as string });
	const { mutateAsync: saveTemplate } = trpc.templates.update.useMutation({
		onSuccess: () => {
			utils.templates.get.invalidate({ id: templateId });
			utils.templates.getVersion.invalidate({ id: templateId, versionId });
		}
	});

	const onNewVersion = useCallback(async() => {
		if (!template) return;

		const copy = structuredClone(version);
		if (!copy) return;
		
		copy._id = nanoid();
		copy.messages = copy.messages.map(m => ({ ...m, _id: nanoid() }));

		await saveTemplate({
			...template,
			versions: [
				copy,
				...template.versions,
			],
		});
		navigate(`/workspaces/${workspaceId}/dashboard/${collectionId}/templates/${templateId}/${copy._id}`);
		
	}, [template, saveTemplate, navigate, workspaceId, collectionId, templateId]);
	
	const versionCount = template?.versions.length ?? 0;

	return (
		<div className="relative">
			<div className="py-2 flex items-center justify-center gap-x-2.5 text-xs leading-5 text-gray-400 hover:text-white  ml-0 bg-gray-700/20">
                <div className="text-white text-base font-bold ml-4">{template?.name}</div>
				<div className="ml-auto mr-4 flex gap-4">
					<Dropdown 
						label={`Version: ${(template && version && versionCount - template.versions.findIndex((x) => x._id === version._id ))}`} 
						rightIcon={<CaretSortIcon />}
						leftIcon={<CounterClockwiseClockIcon />}
						options={template?.versions.map((x, i) => ({ value: `Version ${versionCount - i}`, key: x._id })) ?? []}
						onChange={(id) => navigate(`/workspaces/${workspaceId}/dashboard/${collectionId}/templates/${templateId}/${id}`)}
					/>
					<Button text="Create new version" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={onNewVersion} className=" hover:text-emerald-500 flex" />
					<Button text="Saved" leftIcon={<CheckCircledIcon className="w-4 h-4" />} onClick={onNewVersion} className=" cursor-not-allowed" />
				</div>
            </div>
			<div className="group max-h-[calc(100vh-200px)] overflow-auto relative flex flex-col hover:bg-emerald-500/5 transition-colors">
					{ version && version.messages.map((message: { role: string; prompt: string; _id: string; }) => (
						<TemplateMessage
							key={message._id}
							role={message.role}
							message={message.prompt}
							variables={template?.variables ?? {}}
						/>
					))}
			</div>
		</div>
	);
};