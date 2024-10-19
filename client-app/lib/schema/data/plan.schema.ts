import { z, ZodSchema } from "zod";

const basePlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  monthy_token: z.number(),
  daily_token: z.number(),
  price: z.number(),
});

export type Plan = z.infer<typeof basePlanSchema>;

export const PlanSchema: z.ZodType<Plan> = basePlanSchema;

export const PlansSchema = z.array(PlanSchema);
