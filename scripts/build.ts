import { consola } from "consola";
import { readJSONSync, writeJSONSync } from "fs-extra";
import { Dirent, existsSync } from "node:fs";
import { resolve } from "node:path";
import { merge } from "lodash-es";

import { zodToJsonSchema } from "zod-to-json-schema";

import {
  agentFiles,
  danceFiles,
  config,
  meta,
  publicDir,
  publicAgentDir,
  schemasDir,
  localeAgentDir,
  dancesDir,
  publicDanceDir,
} from "./const";
import { VidolAgent, VidolAgentSchema } from "./schema/agent";
import { VidolDance, VidolDanceSchema } from "./schema/dance";
import {
  checkDir,
  checkJSON,
  getBuildLocaleAgentFileName,
  getLocaleAgentFileName,
} from "./utils";
import { Parser } from "./Parser";

import { formatDanceSchema, formatAgentSchema } from "./check";

class Builder {
  private agents: Dirent[];
  private dances: Dirent[];

  constructor() {
    checkDir(publicDir);
    checkDir(publicAgentDir);
    checkDir(publicDanceDir);
    this.agents = agentFiles;
    this.dances = danceFiles;
  }

  run = async () => {
    this.buildSchema();
    await this.buildAssets();
  };

  buildSchema = () => {
    checkDir(schemasDir);
    checkDir(resolve(publicDir, "schema"));

    // Agent
    consola.start(`build agent schema`);
    const schema = zodToJsonSchema(VidolAgentSchema);
    const fileName = `vidolAgentSchema_v${meta.schemaVersion}.json`;
    writeJSONSync(resolve(schemasDir, fileName), schema);
    writeJSONSync(resolve(publicDir, "schema", fileName), schema);
    consola.success(`build success`);

    // Dance
    consola.start(`build dance schema`);
    const danceSchema = zodToJsonSchema(VidolDanceSchema);
    const danceFileName = `vidolDanceSchema_v${meta.schemaVersion}.json`;
    writeJSONSync(resolve(schemasDir, danceFileName), danceSchema);
    writeJSONSync(resolve(publicDir, "schema", danceFileName), danceSchema);
    consola.success(`build success`);
  };

  buildDances = async () => {
    consola.start(`build dances`);

    const danceIndex: VidolDance[] = [];
    for (const file of this.dances) {
      // if file is not json ,skip it
      if (!checkJSON(file)) continue;

      const [id] = file.name.split(".");
      const dance = readJSONSync(resolve(dancesDir, file.name)) as VidolDance;

      // format and check schema
      const formatDance = formatDanceSchema(dance);

      // write agent to public dir
      writeJSONSync(resolve(publicDanceDir, file.name), formatDance);

      // add agent meta to index
      danceIndex.push({
        danceId: id,
        ...formatDance,
      });
    }

    const dances = danceIndex.sort(
      // @ts-ignore
      (a, b) => new Date(b.createAt) - new Date(a.createAt)
    );

    consola.info(`collected ${dances.length} dances`);
    const dancesIndex = { ...meta, dances };

    const indexFileName = "index.json";
    writeJSONSync(resolve(publicDanceDir, indexFileName), dancesIndex);
    consola.success(`build complete`);
  };

  buildSingleLocaleAgents = (locale: string) => {
    consola.start(`build agents`);

    const agentIndex: VidolAgent[] = [];
    for (const file of this.agents) {
      // if file is not json ,skip it
      if (!checkJSON(file)) continue;

      const {
        content,
        locale: defaultLocale,
        id,
      } = Parser.parseFile(file.name);

      const localeFileName = getLocaleAgentFileName(id, locale);

      // find correct agent content
      let agent: VidolAgent;
      if (defaultLocale === locale) {
        agent = content;
      } else {
        // if locale agent is not exist, skip it
        const filePath = resolve(localeAgentDir, localeFileName);
        if (!existsSync(filePath)) continue;

        // merge default agent with data
        const data = readJSONSync(filePath);
        agent = merge({}, content, data);
      }

      // format and check schema
      const formatAgent: VidolAgent = formatAgentSchema(agent);

      // write agent to public dir
      writeJSONSync(
        resolve(publicAgentDir, getBuildLocaleAgentFileName(id, locale)),
        formatAgent
      );

      // add agent meta to index
      agentIndex.push({
        agentId: id,
        author: formatAgent.author,
        homepage: formatAgent.homepage,
        createAt: formatAgent.createAt,
        meta: {
          name: formatAgent.meta.name,
          avatar: formatAgent.meta.avatar,
          category: formatAgent.meta.category,
          cover: formatAgent.meta.cover,
          description: formatAgent.meta.description,
        },
      });
    }

    const agents = agentIndex.sort(
      // @ts-ignore
      (a, b) => new Date(b.createAt) - new Date(a.createAt)
    );

    return agents;
  };

  buildFullLocaleAgents = async () => {
    for (const locale of config.outputLocales) {
      consola.start(`build ${locale}`);

      const agents = this.buildSingleLocaleAgents(locale);

      consola.info(`collected ${agents.length} agents`);
      const agentsIndex = { ...meta, agents };

      const indexFileName = getBuildLocaleAgentFileName("index", locale);
      writeJSONSync(resolve(publicDir, indexFileName), agentsIndex);
      consola.success(`build ${locale}`);
    }
  };

  buildAssets = async () => {
    await this.buildFullLocaleAgents();
    await this.buildDances();
  };
}

await new Builder().run();
