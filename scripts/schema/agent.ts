import { z } from "zod";

/**
 * TTS Schema
 */
export const TTSSchema = z.object({
  engine: z.string(),
  locale: z.string(),
  voice: z.string(),
  speed: z.number().optional(),
  pitch: z.number().optional(),
});

export const MetaSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  cover: z.string(),
  avatar: z.string(),
  readme: z.string().optional(),
});

/**
 * Agent Schema
 */
export const VidolAgentSchema = z.object({
  agentId: z.string(),
  tts: TTSSchema.optional(),
  meta: MetaSchema,
  homepage: z.string().optional(),
  systemRole: z.string(),
  createAt: z.string(),
  schemaVersion: z.number(),
});

export type VidolAgent = z.infer<typeof VidolAgentSchema>;
