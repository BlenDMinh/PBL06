"use server";

import { Query, QuerySchema } from "@/lib/schema/data/query.schema";
import WrapperResponse from "@/lib/schema/wrapper.schema";
import { getAIServerAxio } from "@/lib/util/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleLogout() {
  console.log("Logging out");
  cookies().delete("access_token");
  cookies().delete("refresh_token");
  redirect("/auth/login");
}

export async function convertImageToText(imageForm: FormData, access_token: string): Promise<Query | null> {
  try {
    const aiServer = getAIServerAxio();

    const response = await aiServer.post("/img2txt", imageForm, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
    const wrapper = WrapperResponse.parse(response.data);
    if (wrapper.data) {
      const query = QuerySchema.parse(wrapper.data.query);
      return query;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}