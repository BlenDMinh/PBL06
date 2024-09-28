import { z } from "zod";
import { Device, DeviceSchema } from "./device.schema";
import { Role, RoleSchema } from "./role.schema";

const baseUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
});

export type User = z.infer<typeof baseUserSchema> & {
  devices?: Device[];
  role?: Role;
};

export const UserSchema: z.ZodType<User> = baseUserSchema.extend({
  devices: z.lazy(() => DeviceSchema.array()).optional(),
  role: z.lazy(() => RoleSchema).optional(),
});
