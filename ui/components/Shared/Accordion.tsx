import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import React from "react";
import { twMerge } from "tailwind-merge";

type TAccordionProps = {
	children: React.ReactNode;
	className?: string;
};

export const AccordionTrigger = React.forwardRef(
	({ children, className, ...props }: TAccordionProps, forwardedRef) => (
		<Accordion.Header className="AccordionHeader">
			<Accordion.Trigger
				className={twMerge("AccordionTrigger", className)}
				{...props}
				// @ts-ignore
				ref={forwardedRef}
			>
				{children}
				<ChevronDownIcon className="AccordionChevron" aria-hidden />
			</Accordion.Trigger>
		</Accordion.Header>
	),
);

export const AccordionContent = React.forwardRef(
	({ children, className, ...props }: TAccordionProps, forwardedRef) => (
		<Accordion.Content
			className={twMerge("AccordionContent", className)}
			{...props}
			// @ts-ignore
			ref={forwardedRef}
		>
			<div className="AccordionContentText">{children}</div>
		</Accordion.Content>
	),
);

