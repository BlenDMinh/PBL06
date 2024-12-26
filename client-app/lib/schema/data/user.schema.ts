import { z } from "zod";

const baseUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
  avatar_id: z.number().nullable(),
  avatar: z.any().nullable(),
});

export type User = z.infer<typeof baseUserSchema>;

export const UserSchema: z.ZodType<User> = baseUserSchema;

export const UsersSchema = z.array(UserSchema);
