import { z } from "zod";
import { Device, DeviceSchema } from "./device.schema";

const basePingDataSchema = z.object({
  id: z.number(),
  time: z.date(),
  locationLat: z.number(),
  locationLong: z.number(),
});

export type PingData = z.infer<typeof basePingDataSchema> & {
  device?: Device;
};

export const PingDataSchema: z.ZodType<PingData> = basePingDataSchema.extend({
  device: z.lazy(() => DeviceSchema).optional(),
});
