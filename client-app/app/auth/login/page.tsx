"use client";

import useAuthenticateStore from "@/lib/store/authenticate.store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serverSideLogin } from "./action";
import { loginSchema } from "@/lib/validation/validation";

type LoginFormInputs = {
  email: string;
  password: string;
};

const serverSideLoginTest = async (email: string, password: string) => {
  return {
    error: false,
    message: "Login successful",
    data: {
      user: {
        id: 1,
        email: email,
        username: "testuser",
        avatar_id: null,
        avatar: "data:image/jpeg;base64,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",
      },
      access_token: "dummyAccessToken",
      refresh_token: "dummyRefreshToken",
    },
  };
};

export default function LoginPage() {
  const authenticationStore = useAuthenticateStore((state) => state);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    
    const response = await serverSideLoginTest(data.email, data.password);
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
          <h1 className="text-xl sm:text-2xl font-bold text-center text-primary">Login</h1>
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
            <button className="btn btn-outline w-full">
              <span>Login</span>
            </button>
            <div className="text-center">
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