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
      content,
      id,
      locale: defaultLocale,
    } = Parser.parseFile(fileName);
    // await formatDanceJSON(content, defaultLocale)
    content = await formatAgentJSON(content, defaultLocale);

    // i18n workflow
    let rawData = {};

    for (const key of config.selectors) {
      const rawValue = get(content, key);
      if (rawValue) set(rawData, key, rawValue);
    }

    if (Object.keys(rawData).length > 0) {
      for (const locale of config.outputLocales) {
        if (locale === defaultLocale) continue;

        const localeFileName = getLocaleAgentFileName(id, locale);
        const localeFilePath = resolve(localesDir, localeFileName);

        // TODO: localMode flat
        if (existsSync(localeFilePath)) continue;

        consola.log("gen", id, `from [${defaultLocale}] to [${locale}]`);
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
