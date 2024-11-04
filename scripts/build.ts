import { consola } from "consola";
import { readJSONSync, writeJSONSync } from "fs-extra";
import { Dirent } from "node:fs";
import { resolve } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  agentFiles,
  danceFiles,
  meta,
  publicDir,
  publicAgentDir,
  schemasDir,
  agentsDir,
  dancesDir,
  publicDanceDir,
} from "./const";
import { VidolAgent, VidolAgentSchema } from "./schema/agent";
import { VidolDance, VidolDanceSchema } from "./schema/dance";
import { checkDir, checkJSON } from "./utils";
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

  buildAgents = async () => {
    consola.start(`build agents`);

    const agentIndex: VidolAgent[] = [];
    for (const file of this.agents) {
      // if file is not json ,skip it
      if (!checkJSON(file)) continue;

      const [id] = file.name.split(".");
      const agent = readJSONSync(resolve(agentsDir, file.name)) as VidolAgent;

      // format and check schema
      const formatAgent: VidolAgent = formatAgentSchema(agent);

      // write agent to public dir
      writeJSONSync(resolve(publicAgentDir, file.name), formatAgent);

      // add agent meta to index
      agentIndex.push({
        agentId: id,
        author: formatAgent.author,
        homepage: formatAgent.homepage,
        createAt: formatAgent.createAt,
        meta: {
          name: formatAgent.meta.name,
          avatar: formatAgent.meta.avatar,
          cover: formatAgent.meta.cover,
          description: formatAgent.meta.description,
        },
      });
    }

    const agents = agentIndex.sort(
      // @ts-ignore
      (a, b) => new Date(b.createAt) - new Date(a.createAt)
    );

    consola.info(`collected ${agents.length} agents`);
    const agentsIndex = { ...meta, agents };

    const indexFileName = "index.json";
    writeJSONSync(resolve(publicAgentDir, indexFileName), agentsIndex);
    consola.success(`build complete`);
  };

  buildAssets = async () => {
    await this.buildAgents();
    await this.buildDances();
  };
}

await new Builder().run();
