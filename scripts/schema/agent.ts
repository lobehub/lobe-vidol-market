import { z } from "zod";

/**
 * TTS Schema
 */
export const TTSSchema = z.object({
  /**
   * 语音引擎，目前支持 'edge'
   */
  engine: z.string(),
  /**
   * 语言
   */
  locale: z.string(),
  /**
   * 语音
   */
  voice: z.string(),
  /**
   * 语速, 0 ~ 3, 正常速度为 1
   */
  speed: z.number().gte(0).lte(3.0).default(1.0),
  /**
   * 音高, 0 ~ 2, 正常音高为 1
   */
  pitch: z.number().gte(0).lte(2.0).default(1.0).optional(),
});

/**
 * Category Enum, 当前包括 Anime, Game, Realistic, VTuber, Book, History, Movie, Animal, Vroid
 */
const CategoryEnum = z.enum([
  "Anime",
  "Game",
  "Realistic",
  "VTuber",
  "Book",
  "History",
  "Movie",
  "Animal",
  "Vroid",
]);

export const MetaSchema = z.object({
  /**
   * 模型名称
   */
  name: z.string(),
  /**
   * 模型描述
   */
  description: z.string(),
  /**
   * 模型主页，比如 Vroid Hub 链接
   */
  homepage: z.string().optional(),
  /**
   * 模型地址
   */
  model: z.string(),
  /**
   * 模型封面图片地址, 推荐尺寸 300 * 400 倍数
   */
  cover: z.string(),
  /**
   * 模型头像图片地址，推荐尺寸 150 * 150 倍数
   */
  avatar: z.string(),
  /**
   * 模型分类
   */
  category: CategoryEnum.optional(),
  /**
   * 模型说明
   */
  readme: z.string().optional(),
});

/**
 * Agent Schema
 */
export const VidolAgentSchema = z.object({
  /**
   * 角色 ID
   */
  agentId: z.string(),
  /**
   * 作者名
   */
  author: z.string(),
  /**
   * 作者主页
   */
  homepage: z.string(),
  /**
   * 语音合成配置
   */
  tts: TTSSchema.optional(),
  /**
   * 角色元信息
   */
  meta: MetaSchema,
  /**
   * 系统角色定义，描述角色如何表现并与用户交互
   */
  systemRole: z.string(),
  /**
   * 问候语，角色在每次聊天开始时说的第一句话
   */
  greeting: z.string(),
  /**
   * 创建时间
   */
  createAt: z.string(),
  /**
   * schema 版本
   */
  schemaVersion: z.number(),
});

export type VidolAgent = z.infer<typeof VidolAgentSchema>;
