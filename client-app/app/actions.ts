"use server";
import { redirect } from "next/navigation";

export async function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  redirect("/auth/login");
}
