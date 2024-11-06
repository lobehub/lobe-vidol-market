import { Dirent, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { config } from "./const";
import { join } from "node:path";
import { colors } from "consola/utils";

import consola from "consola";

export const writeJSON = (filePath, data, format = true) => {
  const jsonStr = format ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  writeFileSync(filePath, jsonStr, "utf8");
};

export const normalizeLocale = (locale?: string): string => {
  if (!locale) return "zh-CN";

  if (locale.startsWith("ar")) return "ar";

  if (locale.startsWith("cn")) return "zh-CN";

  for (const l of config.outputLocales) {
    if (l.startsWith(locale)) {
      return l;
    }
  }

  return "en-US";
};

export const split = (name) => {
  consola.log("");
  consola.log(
    colors.gray(
      `========================== ${name} ==============================`
    )
  );
};

export const checkDir = (dirpath) => {
  if (!existsSync(dirpath)) mkdirSync(dirpath);
};

export const checkJSON = (file: Dirent) =>
  file.isFile() && file.name?.endsWith(".json");

export const getLocaleAgentFileName = (id: string, locale?: string) => {
  const formatedLocale = normalizeLocale(locale);
  const localeSuffix =
    formatedLocale === config.entryLocale ? "" : `.${formatedLocale}`;
  return join(id, "index" + localeSuffix + ".json");
};

export const getBuildLocaleAgentFileName = (id: string, locale?: string) => {
  const formatedLocale = normalizeLocale(locale);
  const localeSuffix =
    formatedLocale === config.entryLocale ? "" : `.${formatedLocale}`;
  return id + localeSuffix + ".json";
};

export const checkHeader = (line: string) => {
  const header = [
    "### systemRole",
    "### agentId",
    "### avatar",
    "### cover",
    "### name",
    "### greeting",
    "### description",
    "### readme",
    "### modelUrl",
    "### model",
    "### gender",
    "### category",
    "### tts",
    "### touch",
    "### params",
    "### danceId",
    "### audio",
    "### src",
    "### thumb",
    "### camera",
  ];
  let check = false;
  header.forEach((item) => {
    if (line.startsWith(item)) check = true;
  });
  return check;
};
