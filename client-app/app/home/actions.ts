"use server";

import { Query, QuerySchema } from "@/lib/schema/data/query.schema";
import WrapperResponse from "@/lib/schema/wrapper.schema";
import { getAIServerAxio } from "@/lib/util/api";
import axios from "axios";
import { ApiError } from "@/lib/errors/ApiError";

export async function convertImageToText(
  imageForm: FormData,
  access_token: string,
  user_id: number
): Promise<Query> {
  try {
    const aiServer = getAIServerAxio();
    const url = `/img2txt?user_id=${user_id}`;
    const response = await aiServer.post(url, imageForm, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
    
    const wrapper = WrapperResponse.parse(response.data);
    if (!wrapper.data?.query) {
      throw new ApiError("No data returned from server");
    }
    
    return QuerySchema.parse(wrapper.data.query);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || "Image processing failed";
      console.error("Axios error:", message);
      const statusCode = error.response?.status || 500;
      throw new ApiError(message, statusCode);
    }
    console.error("Unexpected error:", error);
    throw new ApiError("An unexpected error occurred during image processing");
  }
}