import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
	BoxIcon,
	CaretDownIcon,
	CheckboxIcon,
	PlusCircledIcon,
} from "@radix-ui/react-icons";
import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { trpc } from "../../utils/trpc";
import { Button } from "./Button";

type TDropdownProps = {
	collectionId: string;
	workspaceId: string;
	label: string;
	primary?: boolean;
	onChange: (key: string) => void;
	selectedIds: string[];
};

export const FilesDropdown = ({
	collectionId,
	workspaceId,
	label,
	primary,
	onChange,
	selectedIds,
}: TDropdownProps) => {
	const utils = trpc.useContext();
	const { data: files } = trpc.files.all.useQuery({
		collectionId: collectionId as string,
	});
	const { mutateAsync: addfile } = trpc.files.add.useMutation();

	const onAddNewFile = useCallback(
		async (e: any) => {
			const file = e.target.files[0];

			const newFile = await addfile({
				name: file.name,
				path: file.path,
				type: file.type,
				workspaceId: workspaceId as string,
				collectionId: collectionId as string,
			});

			if (newFile) {
				onChange?.(newFile._id);
				utils.files.all.invalidate();
			}
		},
		[selectedIds, addfile],
	);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<div className="relative border-0 hover:border-0 w-full">
					<Button
						primary={primary}
						text={label}
						leftIcon={<PlusCircledIcon />}
						rightIcon={<CaretDownIcon />}
						className="text-left"
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
					<DropdownMenu.Group>
						<div className="px-4 py-2 text-left text-sm rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none cursor-pointer last:mb-4">
							<label
								htmlFor="file-upload"
								className="cursor-pointer text-white flex"
							>
								<PlusCircledIcon className="mt-1 mr-2" />
								<span>Add a new file</span>
							</label>
							<input
								id="file-upload"
								className="hidden"
								type="file"
								accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
								aria-label="Pick a file from your computer"
								onChange={onAddNewFile}
							/>
						</div>
					</DropdownMenu.Group>

					{(files ?? []).map((file) => (
						<div key={file._id}>
							<DropdownMenu.Item
								onClick={(e) => {
									e.preventDefault();
									onChange?.(file._id);
								}}
								className="w-full flex px-4 py-2 text-left text-sm rounded hover:bg-zinc-100 hover:text-white dark:hover:bg-zinc-800 focus:outline-none cursor-pointer last:mb-4"
							>
								{selectedIds.includes(file._id) ? (
									<CheckboxIcon className="inline-block mr-2" />
								) : (
									<BoxIcon className="inline-block mr-2" />
								)}
								<span>{file.name}</span>
							</DropdownMenu.Item>
						</div>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};

