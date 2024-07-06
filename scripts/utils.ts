import { Dirent, existsSync, mkdirSync, writeFileSync } from "node:fs";

export const writeJSON = (filePath, data, format = true) => {
  const jsonStr = format ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  writeFileSync(filePath, jsonStr, "utf8");
};

export const checkDir = (dirpath) => {
  if (!existsSync(dirpath)) mkdirSync(dirpath);
};

export const checkJSON = (file: Dirent) =>
  file.isFile() && file.name?.endsWith(".json");


export const checkHeader = (line: string) => {
  const header = [
    '### systemRole',
    '### agentId',
    '### avatar',
    '### cover',
    '### name',
    '### description',
    '### modelUrl',
    '### model',
    '### gender',
    '### category',
    '### tts',
    '### touch',
    '### params',


  ];
  let check = false;
  header.forEach((item) => {
    if (line.startsWith(item)) check = true;
  });
  return check;
};