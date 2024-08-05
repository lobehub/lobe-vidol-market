// 格式化JSON
import { consola } from "consola";
import { get, set } from "lodash-es";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { Parser } from "./Parser";
import { formatAgentJSON, formatDanceJSON, formatPrompt } from "./check";
import { agentFiles, danceFiles, config, localesDir } from "./const";
import { translateJSON } from "./i18n";
import { checkJSON, getLocaleAgentFileName, split, writeJSON } from "./utils";

class Formatter {
  formatJSON = async (fileName: string) => {
    consola.start(fileName);
    let {
      content: agent,
      id,
      locale: defaultLocale,
    } = Parser.parseFile(fileName);
    // consola.info('最初的模型', agent)
    // await formatDanceJSON(content, defaultLocale)
    // TODO:这一步出了问题
    agent = await formatAgentJSON(agent, defaultLocale);
    // consola.info('格式化后模型', agent)

    // i18n workflow
    let rawData = {};

    for (const key of config.selectors) {
      const rawValue = get(agent, key);
      // consola.info(`挽歌测试>>> ${key} ${rawValue}`);
      if (rawValue) set(rawData, key, rawValue);
    }

    if (Object.keys(rawData).length > 0) {
      for (const locale of config.outputLocales) {
        if (locale === defaultLocale) continue;

        const localeFileName = getLocaleAgentFileName(id, locale);
        const localeFilePath = resolve(localesDir, localeFileName);

        // TODO: localMode flat
        if (existsSync(localeFilePath)) continue;

        consola.log("translating", id, `from [${defaultLocale}] to [${locale}]`);
        const translateResult = await translateJSON(
          rawData,
          locale,
          defaultLocale
        );
        if (translateResult) {
          translateResult.systemRole = await formatPrompt(
            translateResult.systemRole,
            config.outputLocales
          );
          writeJSON(localeFilePath, translateResult);
          consola.success(`${locale} generated`);
        }
      }
    }

    consola.success(`format success`);
  };

  run = async () => {
    consola.start("Start format json content...");

    for (const file of agentFiles) {
      if (checkJSON(file)) {
        await this.formatJSON(file.name);
      }
    }
    // for (const file of danceFiles) {
    //   if (checkJSON(file)) {
    //     await this.formatJSON(file.name);
    //   }
    // }
  };
}

split("FORMAT JSON CONTENT");

await new Formatter().run();
