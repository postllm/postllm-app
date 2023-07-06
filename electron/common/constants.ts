import appConfig from "../../package.json";

const env = process["env"];

// App Stuff
export const getAppVersion = () => appConfig.version;
export const getProductName = () => appConfig.name;
export const getAppId = () => "com.postllm.app";
export const getAppPlatform = () => process.platform;
export const isMac = () => getAppPlatform() === "darwin";
export const isLinux = () => getAppPlatform() === "linux";
export const isWindows = () => getAppPlatform() === "win32";
export const getAppEnvironment = () => process.env.INSOMNIA_ENV || "production";
export const isDevelopment = () => getAppEnvironment() === "development";
export const changelogUrl = () => "";

export const DB_PERSIST_INTERVAL = 1000 * 60 * 30; // Compact every once in a while
export const DEBOUNCE_MILLIS = 100;

