"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import api from "@/lib/util/api";
export async function handleLogout() {
  console.log("Logging out");
  cookies().delete("access_token");
  cookies().delete("refresh_token");
  redirect("/auth/login");
}

