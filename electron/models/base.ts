import { z } from "zod";

export const BaseModelSchema = z.object({
	_id: z.string(),
	type: z.string(),
	modifiedAt: z.number(),
	createdAt: z.number(),
});

export type IBaseModel = z.infer<typeof BaseModelSchema>;
