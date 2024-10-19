"use client";

import useAuthenticateStore from "@/lib/store/authenticate.store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serverSideRegister } from "./action";
import { registerSchema } from "@/lib/validation/validation";

type RegisterFormInputs = {
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const authenticationStore = useAuthenticateStore((state) => state);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    const response = await serverSideRegister(data.email, data.password);
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
  };

  return (
    <>
      <div className="grid items-center justify-items-center min-h-screen p-4 sm:p-8 pb-20 gap-8 sm:gap-16 font-[family-name:var(--font-geist-sans)]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md bg-base-200 border-2 border-primary shadow-xl rounded-3xl flex flex-col p-6 sm:p-8 gap-6 sm:gap-10 items-center"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-center text-primary">Register</h1>
          <div className="w-full flex flex-col items-start gap-4 sm:gap-8">
            <div className="w-full flex flex-col items-start gap-2">
              <input
                type="text"
                placeholder="Email"
                {...register("email")}
                className="input input-bordered w-full"
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
            <div className="w-full flex flex-col items-start gap-2">
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className="input input-bordered w-full"
              />
              {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>
            <div className="w-full flex flex-col items-start gap-2">
              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className="input input-bordered w-full"
              />
              {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
            </div>
            <button className="btn btn-outline w-full">
              <span>Register</span>
            </button>
            <div className="text-center">
              <span>Already have an account? </span>
              <Link
                href="/auth/login"
                className="transition-all text-info hover:text-base-content"
              >
                Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}