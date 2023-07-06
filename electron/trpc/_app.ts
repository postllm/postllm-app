import { collectionsRouter } from "./routes/collections.router";
import { configRouter } from "./routes/config.router";
import { gridsRouter } from "./routes/grids.router";
import { llmRouter } from "./routes/llm.router";
import { templatesRouter } from "./routes/templates.router";
import { workspacesRouter } from "./routes/workspaces.router";
import { router } from "./trpc";

export const appRouter = router({
	config: configRouter,
	workspaces: workspacesRouter,
	collections: collectionsRouter,
	templates: templatesRouter,
	grids: gridsRouter,
	llm: llmRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

