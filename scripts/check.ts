import { consola } from "consola";
import dayjs from "dayjs";
import { remark } from 'remark';
import pangu from 'remark-pangu';

import { VidolAgentSchema } from "./schema/agent";
import { VidolDanceSchema } from "./schema/dance";
import { config, meta } from './const';
/**
 * @description 格式化 agent schema
 * **/ 
export const formatAgentSchema = (agent) => {
  if (!agent.schemaVersion) agent.schemaVersion = meta.schemaVersion;
  if (!agent.createAt) agent.createAt = dayjs().format('YYYY-MM-DD');

  const result = VidolAgentSchema.safeParse(agent);

  if (result.success) {
    consola.success(`schema check pass`);
  } else {
    consola.error(`schema check fail`);
    throw new Error((result as any).error);
  }
  return agent;
};
/**
 * @description 格式化 dance schema
 * **/ 
export const formatDanceSchema = (dance) => {
  if (!dance.schemaVersion) dance.schemaVersion = meta.schemaVersion;

  const result = VidolDanceSchema.safeParse(dance);

  if (result.success) {
    consola.success(`schema check pass`);
  } else {
    consola.error(`schema check fail`);
    throw new Error((result as any).error);
  }
  return dance;
};
/**
 * @description 根据 locale 格式化 agent schema
*/
export const formatPrompt = async (prompt: string, locale: string) => {
  return locale === 'zh-CN'
    ? String(await remark().use(pangu).process(prompt))
    : String(await remark().process(prompt));
};

export const formatAgentJSON = async (agent: LobeAgent, locale: string = config.entryLocale) => {
  formatAndCheckSchema(agent);
  agent.config.systemRole = await formatPrompt(agent.config.systemRole, locale);

  agent.config.systemRole = await format(agent.config.systemRole, { parser: 'markdown' });
  agent.identifier = kebabCase(agent.identifier);
  if (agent?.meta?.tags?.length > 0) {
    agent.meta.tags = agent.meta.tags.map((tag) => kebabCase(tag));
  }
  return agent;
};