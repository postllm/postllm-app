import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import electron from "vite-electron-plugin";
import renderer from "vite-plugin-electron-renderer";
import pkg from "./package.json";
dotenv.config(); // load env vars from .env

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
	rmSync("dist-electron", { recursive: true, force: true });

	return {
		build: {
			minify: true
		},
		resolve: {
			alias: {
				"@": path.join(__dirname, "src"),
			},
		},
		plugins: [
			react(),
			electron({
				include: ["electron"]
			}),
			// Use Node.js API in the Renderer-process
			renderer(),
		],
		server:
			process.env.VSCODE_DEBUG &&
			(() => {
				const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
				return {
					host: url.hostname,
					port: +url.port,
				};
			})(),
		clearScreen: false,
	};
});

