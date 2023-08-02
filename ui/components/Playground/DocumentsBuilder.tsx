import * as Accordion from "@radix-ui/react-accordion";
import { CaretSortIcon, Cross2Icon, FileTextIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";
import { trpc } from "../../utils/trpc";
import { Button } from "../Shared/Button";
import { FilesDropdown } from "../Shared/FilesDropdown";
import { SectionTitle } from "../Shared/SectionTitle";

type TDocumentsBuilderProps = {
	templateId: string;
	versionId: string;
	collectionId: string;
};

export const DocumentsBuilder = ({
	templateId,
	versionId,
	collectionId,
}: TDocumentsBuilderProps) => {
	const utils = trpc.useContext();
	const { data: files } = trpc.files.all.useQuery({
		collectionId: collectionId as string,
	});
	const { data: template } = trpc.templates.get.useQuery(
		{
			id: templateId as string,
		},
		{ enabled: !!templateId },
	);
	const { mutate: saveTemplate } = trpc.templates.update.useMutation({
		onSuccess: () => {
			utils.templates.get.invalidate({ id: templateId });
			utils.templates.getVersion.invalidate({
				id: templateId,
				versionId,
			});
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
		[template, saveTemplate],
	);

	return (
		<div className="w-full my-2 text-center">
			<Accordion.Root
				className="AccordionRoot"
				type="single"
				defaultValue="item-1"
				collapsible
			>
				<Accordion.Item className="AccordionItem" value="item-1">
					<Accordion.AccordionTrigger className="w-full items-center justify-between font-medium transition-all">
						<SectionTitle
							title="Files"
							leftIcon={<FileTextIcon className="text-white" />}
							actionIcon={
								<CaretSortIcon className="text-white mr-4" />
							}
						/>
					</Accordion.AccordionTrigger>
					<Accordion.AccordionContent>
						<div>
							<ul className="dark:divide-white/5 text-sm mb-5">
								{(template?.fileIds ?? []).map((fileId) => {
									const file = files?.find(
										(f) => f._id === fileId,
									);
									if (!file) return null;

									return (
										<li
											key={fileId}
											className="m-0 text-left px-4 py-2 first:pt-2 last:pb-0 text-zinc-400 dark:text-zinc-500"
										>
											<div className="flex gap-2">
												<p>{file.name}</p>
												<div className="ml-auto">
													<Button
														onClick={() =>
															onFilesChange(
																file._id,
															)
														}
														rightIcon={
															<Cross2Icon className="w-3 h-3" />
														}
														text=""
													/>
												</div>
											</div>
										</li>
									);
								})}
							</ul>
						</div>
						<div className="m-auto mt-2">
							<FilesDropdown
								selectedIds={template?.fileIds || []}
								collectionId={template?.collectionId as string}
								workspaceId={template?.workspaceId as string}
								label={"Add files"}
								onChange={onFilesChange}
							/>
						</div>
					</Accordion.AccordionContent>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	);
};

