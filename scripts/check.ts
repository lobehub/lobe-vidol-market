import { consola } from "consola";
// markdown
import { remark } from 'remark';
import { format } from 'prettier';
import { kebabCase } from 'lodash-es';
import pangu from 'remark-pangu';
import dayjs from "dayjs";

import { VidolAgentSchema,VidolAgent } from "./schema/agent";
import { VidolDanceSchema,VidolDance } from "./schema/dance";
import { config, meta } from './const';
/**
 * @description 格式化&校验 agent
 * **/ 
export const formatAgentSchema = (agent) => {
  if (!agent.schemaVersion) agent.schemaVersion = meta.schemaVersion;
  if (!agent.createAt) agent.createAt = dayjs().format('YYYY-MM-DD');

  const result = VidolAgentSchema.safeParse(agent);

  if (result.success) {
    consola.success(`agent schema check pass`);
  } else {
    consola.error(`agent schema check fail`);
    throw new Error((result as any).error);
  }
  return agent;
};
/**
 * @description 格式化 dance schema
 * **/ 
export const formatDanceSchema = (dance) => {
  if (!dance.schemaVersion) dance.schemaVersion = meta.schemaVersion;
  if (!dance.createAt) dance.createAt = dayjs().format('YYYY-MM-DD');

  const result = VidolDanceSchema.safeParse(dance);

  if (result.success) {
    consola.success(`dance schema check pass`);
  } else {
    consola.error(`dance schema check fail`);
    throw new Error((result as any).error);
  }
  return dance;
};
/**
 * @description 根据 locale 处理 prompt
*/
export const formatPrompt = async (prompt: string, locale: string) => {
  return locale === 'zh-CN'
    ? String(await remark().use(pangu).process(prompt))
    : String(await remark().process(prompt));
};

export const formatAgentJSON = async (agent: VidolAgent, locale: string = config.entryLocale) => {
  formatAgentSchema(agent);
  agent.systemRole = await formatPrompt(agent.systemRole, locale);
  agent.greeting = await formatPrompt(agent.greeting, locale);
  agent.systemRole = await format(agent.systemRole, { parser: 'markdown' });
  agent.greeting = await format(agent.greeting, { parser: 'markdown' });
  return agent;
};

export const formatDanceJSON = async (dance: VidolDance, locale: string = config.entryLocale) => {
  formatDanceSchema(dance);
  dance.name = await formatPrompt(dance.name, locale);
  dance.readme = await formatPrompt(dance.readme, locale);
  dance.name = await format(dance.name, { parser: 'markdown' });
  dance.readme = await format(dance.readme, { parser: 'markdown' });
  return dance;
};