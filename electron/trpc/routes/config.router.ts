import { app } from "electron";
import { z } from "zod";
import { config } from "../../models";
import { getLicense } from "../../remote/api";
import { procedure, router } from "../trpc";

export const configRouter = router({
	version: procedure.query(async ({ input, ctx }) => {
		return await app.getVersion();
	}),
	get: procedure.query(async ({ input, ctx }) => {
		return await config.get();
	}),
	update: procedure.input(config.schema).mutation(async ({ input, ctx }) => {
		return await config.update(input);
	}),
	hasLicense: procedure.output(z.boolean()).query(async ({ input, ctx }) => {
		const nodeEnv = process.env.NODE_ENV;
		if (nodeEnv === "development") return true;

		const _config = await config.get();
		if (!_config) return false;
		return _config.licenseValid;
	}),
	updateLicense: procedure
		.input(z.object({ licenseKey: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const _config = await config.get();
			if (!_config) return;

			await config.update({
				..._config,
				licenseKey: input.licenseKey,
				licenseValid: false,
			});

			const data = await getLicense(_config.userId, input.licenseKey);
			if (!data) return;

			if (data.expires_at)
				await config.update({
					..._config,
					licenseValid: Boolean(Date.now() < data.expires_at),
				});

			return data;
		}),
});

