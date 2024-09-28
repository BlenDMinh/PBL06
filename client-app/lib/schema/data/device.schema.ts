import { z } from "zod";
import { User, UserSchema } from "./user.schema";
import { PingData, PingDataSchema } from "./ping_data.schema";

const baseDeviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  isOn: z.boolean(),
});

export type Device = z.infer<typeof baseDeviceSchema> & {
  owner?: User;
  pingDatas?: PingData[];
};

export const DeviceSchema: z.ZodType<Device> = baseDeviceSchema.extend({
  owner: z.lazy(() => UserSchema).optional(),
  pingDatas: z.lazy(() => PingDataSchema.array()).optional(),
});
