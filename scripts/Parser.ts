// 解析给定的文件名，读取相应的 JSON 文件，并返回
import { readJSONSync } from "fs-extra";
import { resolve } from "node:path";

import { agentsDir, dancesDir, config } from "./const";
import { VidolDance } from "./schema/dance";
import { VidolAgent } from "./schema/agent";

export const Parser = {
  parseFile: (fileName: string) => {
    // <id>.<locale>  test: https://regex101.com/r/t744SN/1
    const regexp = /^(?<id>[\w-]*)\.?(?<locale>.*)?$/;

    const match = regexp.exec(fileName.replace(".json", ""));
    const { id, locale = config.entryLocale } = match.groups;

    const agentsFilePath = resolve(agentsDir, fileName);
    const dancesFilePath = resolve(dancesDir, fileName);

    let agent: VidolAgent = readJSONSync(agentsFilePath);
    let dance: VidolDance = readJSONSync(dancesFilePath);
    let content = agent || dance;
    return { content, id, locale };
  },
};
