import { z } from "zod";
/**
 * Dance Schema
 */
export const VidolDanceSchema = z.object({
  danceId: z.string(),
  /**
   * 舞蹈名
   */
  name: z.string(),
  /**
   * 舞蹈文件地址
   */
  src: z.string(),
  /**
   * 作者名
   */
  author: z.string(),
  /**
   * 作者主页
   */
  homepage: z.string(),
  /**
   * 音频文件地址
   */
  audio: z.string(),
  /**
   * 封面图片地址，推荐尺寸 320 * 480 倍数
   */
  cover: z.string(),
  /**
   * 缩略图地址，推荐尺寸 256 * 256 倍数
   */
  thumb: z.string(),
  /**
   * 说明文字
   */
  readme: z.string().optional(),
  /**
   * 创建时间
   */
  createAt: z.string(),
  /**
   * schema 版本
   */
  schemaVersion: z.number(),
});

export type VidolDance = z.infer<typeof VidolDanceSchema>;
