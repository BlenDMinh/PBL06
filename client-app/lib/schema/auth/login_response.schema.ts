import WrapperResponse from "../wrapper.schema";
import { UserSchema } from "../data/user.schema";
import { z } from "zod";

const LoginResponseSchema = WrapperResponse.extend({
  data: z
    .object({
      user: UserSchema,
      access_token: z.string(),
      refresh_token: z.string(),
    })
    .nullish(),
});

export default LoginResponseSchema;
