import { z } from "zod";

const baseImageSchema = z.object({
  id: z.number(),
  image_url: z.string(),
  created_at: z
    .string()
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), { message: "Invalid date format" }),
});

export type Image = z.infer<typeof baseImageSchema>;

export const ImageSchema: z.ZodType<
  Image,
  z.ZodTypeDef,
  { id: number; image_url: string; created_at: string }
> = baseImageSchema;

export const ImagesSchema = z.array(ImageSchema);
