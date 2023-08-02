import { initTRPC } from "@trpc/server";
import { app } from "electron";
import { config } from "../models/index";
import axiom from "../utils/axiom";

const t = initTRPC.create({ isServer: true });

export const loggerMiddleware = t.middleware(async ({ path, next, ctx }) => {
	const result = await next();
	const platform = process.platform;
	const version = app.getVersion();
	const user = await config.get();

	const data = {
		path,
		platform,
		version,
		env: process.env.NODE_ENV,
		ok: result.ok,
		user: user && {
			_id: user._id,
			licenseValid: user.licenseValid,
			createdAt: user.createdAt,
		},
	};
	axiom("app", data);
	console.log(Date.now(), JSON.stringify(data, null, 0));
	if (!result.ok) console.error(result.error);

	return result;
});

export const router = t.router;
export const procedure = t.procedure.use(loggerMiddleware);

