import { readJSONSync } from "fs-extra";
import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
export const root = resolve(__dirname, "..");

export const agentsDir = resolve(root, "./src/agents");
export const dancesDir = resolve(root, "./src/dances");
export const localesDir = resolve(root, './locales');

export const schemasDir = resolve(root, "./schema");
export const publicDir = resolve(root, "./public");
export const publicAgentDir = resolve(root, "./public/agents");
export const publicDanceDir = resolve(root, "./public/dances");

export const agentFiles = readdirSync(agentsDir, { withFileTypes: true });
export const danceFiles = readdirSync(dancesDir, { withFileTypes: true });
export const locales = readdirSync(localesDir, { withFileTypes: true });

export const indexPath = resolve(publicDir, "index.json");

export const metaPath = resolve(root, "meta.json");
export const meta = readJSONSync(metaPath);

export const githubHomepage = 'https://github.com/lobehub/lobe-vidol-market';
export { default as config } from '../.i18nrc.cjs';
