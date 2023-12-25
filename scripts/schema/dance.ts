import { z } from "zod";
/**
 * Dance Schema
 */
export const VidolAgentSchema = z.object({
  danceId: z.string(),
  name: z.string(),
  createAt: z.string(),
  schemaVersion: z.number(),
});
