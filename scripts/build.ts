import { consola } from "consola";
import { readJSONSync, writeJSONSync } from "fs-extra";
import { Dirent } from "node:fs";
import { resolve } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  agents,
  meta,
  publicDir,
  publicAgentDir,
  schemasDir,
  agentsDir,
} from "./const";
import { VidolAgent, VidolAgentSchema } from "./schema/agent";
import { checkDir, checkJSON } from "./utils";
import { formatAndCheckSchema } from "./check";

class Builder {
  private agents: Dirent[];

  constructor() {
    checkDir(publicDir);
    checkDir(publicAgentDir);
    this.agents = agents;
  }

  run = async () => {
    this.buildSchema();
    await this.buildAgents();
  };

  buildSchema = () => {
    consola.start(`build agent schema`);
    checkDir(schemasDir);
    checkDir(resolve(publicDir, "schema"));

    const schema = zodToJsonSchema(VidolAgentSchema);
    const fileName = `vidolAgentSchema_v${meta.schemaVersion}.json`;
    writeJSONSync(resolve(schemasDir, fileName), schema);
    writeJSONSync(resolve(publicDir, "schema", fileName), schema);
    consola.success(`build success`);
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
      const formatAgent = formatAndCheckSchema(agent);

      // write agent to public dir
      writeJSONSync(resolve(publicAgentDir, file.name), formatAgent);

      // write agent to agents dir
      writeJSONSync(resolve(agentsDir, file.name), formatAgent);

      // add agent meta to index
      agentIndex.push({
        agentId: id,
        ...formatAgent,
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
}

await new Builder().run();
