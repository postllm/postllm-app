import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { twMerge } from "tailwind-merge";

type TBannerProps = {
	icon: React.ReactNode;
	text: string;
	className?: string;
};

export default function Banner({ icon, text, className }: TBannerProps) {
	return (
		<div
			className={twMerge(
				"w-full my-6 flex gap-2.5 rounded-2xl border  p-4 leading-6  border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
				className,
			)}
		>
			{icon}
			<div className="[&amp;>:first-child]:mt-0 [&amp;>:last-child]:mb-0">
				<p>{text}</p>
			</div>
		</div>
	);
}
type TWarningBannerProps = {
	text: string;
	className?: string;
};

export function WarningBanner({ text }: TWarningBannerProps) {
	return (
		<Banner
			text={text}
			className="border-yellow-500/20 bg-yellow-300/20 text-yellow-200"
			icon={<ExclamationTriangleIcon className="mt-1" />}
		/>
	);
}

