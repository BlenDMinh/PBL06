import { permission } from "process";
import { z } from "zod";

const baseRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissions: z.number(),
});

export type Role = z.infer<typeof baseRoleSchema>;

export const RoleSchema: z.ZodType<Role> = baseRoleSchema;
