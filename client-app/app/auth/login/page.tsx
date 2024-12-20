// page.tsx
"use client";

import useAuthenticateStore from "@/lib/store/authenticate.store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serverSideLogin } from "./action";
import { loginSchema } from "@/lib/validation/validation";
import { toast } from "react-toastify";
import Loader from "@/components/layout/loader";
import { useState } from "react";
import { ApiError } from "@/lib/errors/ApiError";
import usePlanStore from '@/lib/store/plan.store';

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { fetchAllPlans, plans } = usePlanStore();
  const [loading, setLoading] = useState(false);
  const authenticationStore = useAuthenticateStore((state) => state);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    try {
      const response = await serverSideLogin(data.email, data.password);
      if (!response.data) {
        toast.error("An error occurred");
        return;
      }
      const user = response.data.user;
      const subscription = response.data.subscription;
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      authenticationStore.saveLoginToken(accessToken, refreshToken);
      await fetchAllPlans(accessToken);
      authenticationStore.setUser(user);
      authenticationStore.setIsAuthenticated(true);
      authenticationStore.setSubscription(subscription);
      toast.success("Login successful!");
      router.push("/");

    } catch (error: any) {
      console.log(error);
      const errorMessage = error.message || "An unexpected error occurred";

      if (errorMessage.toLowerCase().includes("invalid email")) {
        setError("email", { type: "manual", message: errorMessage });
      } else if (errorMessage.toLowerCase().includes("invalid password")) {
        setError("password", { type: "manual", message: errorMessage });
      } else {
        toast.error(errorMessage);
        console.error("Login error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid items-center justify-items-center min-h-screen p-4 sm:p-8 pb-20 gap-8 sm:gap-16 font-[family-name:var(--font-geist-sans)]">
      {loading && <Loader />}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-base-200 border-2 border-primary shadow-xl rounded-3xl flex flex-col p-6 sm:p-8 gap-6 sm:gap-10 items-center"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-center text-primary">Login</h1>
        <div className="w-full flex flex-col items-start gap-4 sm:gap-8">
          <div className="w-full flex flex-col items-start gap-2">
            <input
              type="text"
              placeholder="Email"
              {...register("email")}
              className="input input-bordered w-full"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email.message}</span>
            )}
          </div>
          <div className="w-full flex flex-col items-start gap-2">
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="input input-bordered w-full"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password.message}</span>
            )}
          </div>
          <button className="btn btn-outline w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <div className="text-center">
            <span>Don't have an account? </span>
            <Link href="/auth/register" className="transition-all text-info hover:text-base-content">
              Register
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}