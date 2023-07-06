import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CaretSortIcon, CheckIcon, ChevronLeftIcon, PlusCircledIcon, PlusIcon } from "@radix-ui/react-icons";
import { twMerge } from "tailwind-merge";
import { trpc } from "../../utils/trpc";
import { Button } from "../Shared/Button";

type TDropdownProps = {
    collectionId: string;
    selectedIds: string[];
	onChange: (templateId: string, versionId: string) => void;
};

export const TemplateVersionsDropdown = ({
    collectionId,
	onChange,
    selectedIds
}: TDropdownProps) => {
	const { data: templates } = trpc.templates.all.useQuery({ collectionId });

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<div className="relative border-0 hover:border-0">
					<Button
						text="Select prompt templates"
                        leftIcon={<PlusCircledIcon />}
                        rightIcon={<CaretSortIcon />}
					/>
				</div>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className={twMerge(
						"z-50 min-w-[200px]",
						"rounded bg-white px-2 py-5 text-sm text-zinc-500 ring-1 ring-zinc-900/10 transition hover:ring-zinc-900/20 dark:bg-[#1D1D20] dark:text-zinc-400 dark:ring-inset dark:ring-white/10 dark:hover:ring-white/20 focus:[&:not(:focus-visible)]:outline-none",
						"will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade",
					)}
					sideOffset={10}
				>
					{(templates ?? []).map((template) => (
						<DropdownMenu.Sub key={template._id}>
                            <DropdownMenu.SubTrigger className="w-full px-4 py-2 text-left text-sm rounded hover:bg-zinc-100 hover:text-white dark:hover:bg-zinc-800 focus:outline-none cursor-pointer">
                                <div className="flex"><ChevronLeftIcon className="mt-1 mr-2" /><span>{template.name}</span></div>
                            </DropdownMenu.SubTrigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.SubContent
                                    className="min-w-[220px] bg-white dark:bg-[#1D1D20] rounded-md p-[5px] text-zinc-500"
                                    sideOffset={2}
                                    alignOffset={-5}
                                >
                                    {template.versions.map((version, index) => (
                                    <DropdownMenu.Item 
                                        onClick={(e) => {
                                            e.preventDefault(); 
                                            onChange(template._id, version._id)}
                                        }
                                        key={version._id} className="w-full px-4 py-2 text-left text-sm rounded hover:bg-zinc-100 hover:text-white dark:hover:bg-zinc-800 focus:outline-none cursor-pointer">
                                        <div className="flex text-zinc-500">
                                            {selectedIds.includes(version._id) ? <CheckIcon className="mt-1 mr-2" /> : <PlusIcon className="mt-1 mr-2" />}
                                            {index === 0 ? 'Latest' : `Version ${template.versions.length - index}`}
                                        </div>
                                    </DropdownMenu.Item>
                                    ))}
                                </DropdownMenu.SubContent>
                            </DropdownMenu.Portal>
						</DropdownMenu.Sub>
					))}

					<DropdownMenu.Arrow className="fill-white" />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};