"use client";

import useAuthenticateStore from "@/lib/store/authenticate.store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { serverSideLogin } from "./action";

export default function LoginPage() {
  const authenticationStore = useAuthenticateStore((state) => state);
  const router = useRouter();
  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const response = await serverSideLogin(email, password);
    if (response.error) {
      alert(response.message);
      return;
    }
    if (!response.data) {
      alert("An error occurred");
      return;
    }
    const user = response.data?.user;
    const accessToken = response.data?.access_token;
    const refreshToken = response.data?.refresh_token;
    authenticationStore.saveLoginToken(accessToken, refreshToken);
    authenticationStore.setUser(user);
    authenticationStore.setIsAuthenticated(true);
    router.push("/");
  }
  return (
    <>
      <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <form
          onSubmit={handleLogin}
          className="w-fit h-96 bg-base-200 border-2 border-primary shadow-xl rounded-3xl flex flex-col p-8 gap-10 items-center"
        >
          <h1 className="text-2xl font-bold text-center text-primary">Login</h1>
          <div className="w-full flex flex-col items-start gap-8">
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                name="email"
                className="grow"
                placeholder="Email"
                required
              />
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <input
                type="password"
                name="password"
                className="grow"
                placeholder="Password"
                required
              />
            </label>
            <button className="btn btn-outline w-full">
              <span>Login</span>
            </button>
            <div>
              <span>Doesn't have an account? </span>
              <Link
                href="/auth/register"
                className="transition-all text-info hover:text-base-content"
              >
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
