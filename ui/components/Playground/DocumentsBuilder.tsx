import * as Accordion from "@radix-ui/react-accordion";
import { CaretSortIcon, Cross2Icon, FileTextIcon } from "@radix-ui/react-icons";
import { trpc } from "../../utils/trpc";
import { Button } from "../Shared/Button";
import { FilesDropdown } from "../Shared/FilesDropdown";
import { SectionTitle } from "../Shared/SectionTitle";

type TDocumentsBuilderProps = {
	collectionId: string;
	workspaceId: string;
	fileIds: string[];
	onToggleFile: (fileId: string) => void;
};

export const DocumentsBuilder = ({
	collectionId,
	workspaceId,
	onToggleFile,
	fileIds,
}: TDocumentsBuilderProps) => {
	const { data: files } = trpc.files.all.useQuery({
		collectionId: collectionId as string,
	});

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
								{(fileIds ?? []).map((fileId) => {
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
															onToggleFile(
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
								selectedIds={fileIds || []}
								collectionId={collectionId as string}
								workspaceId={workspaceId as string}
								label={"Add files"}
								onChange={onToggleFile}
							/>
						</div>
					</Accordion.AccordionContent>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	);
};

