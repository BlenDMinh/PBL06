import { z } from "zod";
import { Device, DeviceSchema } from "./device.schema";
import { Role, RoleSchema } from "./role.schema";

const baseUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
});

export type User = z.infer<typeof baseUserSchema>;

export const UserSchema: z.ZodType<User> = baseUserSchema;
