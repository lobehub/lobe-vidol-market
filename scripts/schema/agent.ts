import { z } from "zod";

/**
 * TTS Schema
 */
export const TTSSchema = z.object({
  engine: z.string(),
  locale: z.string(),
  voice: z.string(),
  speed: z.number(),
  pitch: z.number(),
});

export const MetaSchema = z.object({
  name: z.string(),
  description: z.string(),
  homepage: z.string(),
  model: z.string(),
  cover: z.string(),
  avatar: z.string(),
  readme: z.string(),
});

/**
 * Agent Schema
 */
export const VidolAgentSchema = z.object({
  agentId: z.string(),
  tts: TTSSchema,
  meta: MetaSchema,
  systemRole: z.string(),
  createAt: z.string(),
  schemaVersion: z.number(),
});

export type VidolAgent = z.infer<typeof VidolAgentSchema>;
