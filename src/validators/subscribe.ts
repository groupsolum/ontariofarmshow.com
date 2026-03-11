import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
  regions: z.array(z.string()).optional(),
  source: z.string().optional(),
});

export type SubscribeFormData = z.infer<typeof subscribeSchema>;
