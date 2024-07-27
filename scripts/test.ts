import { consola } from "consola";
import { readJSONSync } from "fs-extra";
import { resolve } from "node:path";

import { formatAgentSchema, formatDanceSchema } from "./check";
import { agentFiles, agentsDir, root, danceFiles, dancesDir } from "./const";

const runTest = () => {
  for (const file of agentFiles) {
    if (file.isFile()) {
      const filePath = resolve(agentsDir, file.name);
      consola.start(filePath.replace(root, ""));
      const agent = readJSONSync(filePath);
      formatAgentSchema(agent);
    }
  }

  // for (const file of danceFiles) {
  //   if (file.isFile()) {
  //     const filePath = resolve(dancesDir, file.name);
  //     consola.start(filePath.replace(root, ""));
  //     const agent = readJSONSync(filePath);
  //     formatDanceSchema(agent);
  //   }
  // }
};

runTest();
