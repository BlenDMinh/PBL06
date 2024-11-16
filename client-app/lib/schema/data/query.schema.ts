import { z } from "zod";
import { Image, ImageSchema } from "./image.schema";

const baseQuerySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  image_id: z.number(),
  image: ImageSchema.nullish(),
  result: z.string(),
  content: z.string().nullish(),
  used_token: z.number(),
  created_at: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid date format" }),
});

export type Query = z.infer<typeof baseQuerySchema>;

export const QuerySchema: z.ZodType<
  Query,
  z.ZodTypeDef,
  {
    id: number;
    user_id: number;
    image_id: number;
    result: string;
    content?: string | null;
    used_token: number;
    created_at: string;
  }
> = baseQuerySchema;

export const QueriesSchema = z.array(QuerySchema);
