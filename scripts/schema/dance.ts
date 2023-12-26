import { z } from "zod";
/**
 * Dance Schema
 */
export const VidolDanceSchema = z.object({
  danceId: z.string(),
  name: z.string(),
  src: z.string(),
  audio: z.string(),
  cover: z.string(),
  thumb: z.string(),
  readme: z.string(),
  createAt: z.string(),
  schemaVersion: z.number(),
});

export type VidolDance = z.infer<typeof VidolDanceSchema>;
