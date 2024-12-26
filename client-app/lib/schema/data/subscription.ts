import { z, ZodSchema } from "zod";

const baseSubscriptionSchema = z.object({
  user_id: z.number(),
  plan_id: z.number(),
  id: z.number(),
  created_at: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid date format" }),
});

export type Subscription = z.infer<typeof baseSubscriptionSchema>;

export const SubscriptionSchema: z.ZodType<
  Subscription,
  z.ZodTypeDef,
  {
    id: number;
    user_id: number;
    plan_id: number;
    created_at: string;
  }
> = baseSubscriptionSchema;


export const SubscriptionsSchema = z.array(SubscriptionSchema);
