import { consola } from "consola";

import { meta } from "./const";
import { VidolAgentSchema } from "./schema/agent";

export const formatAndCheckSchema = (agent) => {
  if (!agent.schemaVersion) agent.schemaVersion = meta.schemaVersion;

  const result = VidolAgentSchema.safeParse(agent);

  if (result.success) {
    consola.success(`schema check pass`);
  } else {
    consola.error(`schema check fail`);
    throw new Error((result as any).error);
  }
  return agent;
};
