import { consola } from "consola";
import dayjs from "dayjs";
import { format } from "prettier";
import { kebabCase } from "lodash-es";
import { config, meta } from "./const";
import { VidolAgent, VidolAgentSchema } from "./schema/agent";
import { VidolDanceSchema } from "./schema/dance";
import pangu from "remark-pangu";
import { remark } from "remark";

export const formatAgentJSON = async (
  agent: VidolAgent,
  locale: string = config.entryLocale
) => {
  formatAgentSchema(agent);
  agent.systemRole = await formatPrompt(agent.systemRole, locale);

  agent.systemRole = await format(agent.systemRole, {
    parser: "markdown",
  });
  agent.agentId = kebabCase(agent.agentId);
  return agent;
};

export const formatPrompt = async (prompt: string, locale: string) => {
  return locale === "zh-CN"
    ? String(await remark().use(pangu).process(prompt))
    : String(await remark().process(prompt));
};

export const formatAgentSchema = (agent) => {
  if (!agent.schemaVersion) agent.schemaVersion = meta.schemaVersion;
  if (!agent.createAt) agent.createAt = dayjs().format("YYYY-MM-DD");

  const result = VidolAgentSchema.safeParse(agent);

  if (result.success) {
    consola.success(`schema check pass`);
  } else {
    consola.error(`schema check fail`);
    throw new Error((result as any).error);
  }
  return agent;
};

export const formatDanceSchema = (dance) => {
  if (!dance.schemaVersion) dance.schemaVersion = meta.schemaVersion;
  if (!dance.createAt) dance.createAt = dayjs().format("YYYY-MM-DD");

  const result = VidolDanceSchema.safeParse(dance);

  if (result.success) {
    consola.success(`schema check pass`);
  } else {
    consola.error(`schema check fail`);
    throw new Error((result as any).error);
  }
  return dance;
};
