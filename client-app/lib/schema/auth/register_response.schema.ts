import WrapperResponse from "../wrapper.schema";
import { UserSchema } from "../data/user.schema";
import { z } from "zod";

const RegisterResponseSchema = WrapperResponse.extend({
  data: z
    .object({
      user: UserSchema,
    })
    .nullish(),
});

export default RegisterResponseSchema;