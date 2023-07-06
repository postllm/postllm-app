import { QueryClient } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { ipcLink } from "electron-trpc/renderer";
import type { AppRouter } from "electron/trpc/_app";

export const queryClient = new QueryClient();
export const trpc = createTRPCReact<AppRouter>();
export const trpcClient = trpc.createClient({ links: [ipcLink()] });

