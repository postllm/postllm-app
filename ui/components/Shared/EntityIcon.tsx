import {
	BookmarkFilledIcon,
	ChatBubbleIcon,
	FileTextIcon,
	ViewGridIcon,
} from "@radix-ui/react-icons";
import { twMerge } from "tailwind-merge";

type TEntityIconProps = {
	entity: {
		type: string;
	};
	className?: string;
};

export default function EntityIcon({ entity, className }: TEntityIconProps) {
	return (
		<>
			{entity.type === "Grid" && (
				<ViewGridIcon className={twMerge("text-rose-400", className)} />
			)}
			{entity.type === "Template" && (
				<BookmarkFilledIcon
					className={twMerge("text-emerald-400", className)}
				/>
			)}
			{entity.type === "File" && (
				<FileTextIcon
					className={twMerge(" text-purple-400", className)}
				/>
			)}
			{entity.type === "Chat" && (
				<ChatBubbleIcon
					className={twMerge(" text-blue-400", className)}
				/>
			)}
		</>
	);
}

