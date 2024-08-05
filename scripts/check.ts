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
  // agent.meta = await formatPrompt(agent.meta, locale);
  // agent.touch = await formatPrompt(agent.touch, locale);
  agent.systemRole = await format(agent.systemRole, { parser: 'markdown' });
  agent.greeting = await format(agent.greeting, { parser: 'markdown' });
  // agent.meta = await format(agent.meta, { parser: 'markdown' });
  // agent.touch = await format(agent.touch, { parser: 'markdown' });
  return agent;
};

export const formatDanceJSON = async (dance: VidolDance, locale: string = config.entryLocale) => {
  formatDanceSchema(dance);
  dance.config.systemRole = await formatPrompt(dance.config.systemRole, locale);

  dance.config.systemRole = await format(dance.config.systemRole, { parser: 'markdown' });
  dance.identifier = kebabCase(dance.identifier);
  if (dance?.meta?.tags?.length > 0) {
    dance.meta.tags = dance.meta.tags.map((tag) => kebabCase(tag));
  }
  return dance;
};