import { BrowserWindow, app, ipcMain, screen, shell } from "electron";
import { createIPCHandler } from "electron-trpc/main";
import { release } from "node:os";
import { join } from "node:path";
import { database } from "../common/database";
import * as models from "../models/index";
import { appRouter } from "../trpc/_app";
import axiom from "../utils/axiom";
import { update } from "./update";

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
	? join(process.env.DIST_ELECTRON, "../public")
	: process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

async function createWindow() {
	const { height, width } = screen.getPrimaryDisplay().workAreaSize;

	win = new BrowserWindow({
		title: "PostLLM",
		width,
		height,
		icon: join(process.env.PUBLIC, "favicon.ico"),
		webPreferences: {
			preload,
			// Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
			// Consider using contextBridge.exposeInMainWorld
			// Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
			nodeIntegration: true,
			contextIsolation: true,
		},
	});

	if (url) {
		// electron-vite-vue#298
		win.loadURL(url);
		// Open devTool if the app is not packaged
		win.webContents.openDevTools();
	} else {
		win.loadFile(indexHtml);
	}

	// Init database
	await database.init(models.types());
	const seeded = await models.config.seeded();
	await models.config.seed();
	if (!seeded) {
		await models.workspace.seed();
		await models.collection.seed();
		await models.promptTemplate.seed();
	}

	// Init TRPC
	createIPCHandler({ router: appRouter, windows: [win] });

	// Test actively push message to the Electron-Renderer
	win.webContents.on("did-finish-load", () => {
		win?.webContents.send(
			"main-process-message",
			new Date().toLocaleString(),
		);
	});

	// Make all links open with the browser, not with the application
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("https:")) shell.openExternal(url);
		return { action: "deny" };
	});

	// Apply electron-updater
	update(win);

	axiom("app", { path: "start" });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	win = null;
	if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
	if (win) {
		// Focus on the main window if the user tried to open another
		if (win.isMinimized()) win.restore();
		win.focus();
	}
});

app.on("activate", () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length) {
		allWindows[0].focus();
	} else {
		createWindow();
	}
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
	const childWindow = new BrowserWindow({
		webPreferences: {
			preload,
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (process.env.VITE_DEV_SERVER_URL) {
		childWindow.loadURL(`${url}#${arg}`);
	} else {
		childWindow.loadFile(indexHtml, { hash: arg });
	}
});

