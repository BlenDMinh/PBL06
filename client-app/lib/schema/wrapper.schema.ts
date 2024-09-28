import { z } from "zod";

const WrapperResponse = z.object({
  message: z.string(),
  error: z.string().nullish(),
  data: z.any().nullish(),
});

export default WrapperResponse;
