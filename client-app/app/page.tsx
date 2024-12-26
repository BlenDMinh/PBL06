"use client";
import Link from "next/link";
import useAuthenticateStore from "@/lib/store/authenticate.store";

export default function Index() {
  const { isAuthenticated } = useAuthenticateStore();

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div>
          <h1 className="text-5xl font-bold">AI Image Classification</h1>
          <p className="py-6">
            Discover the power of artificial intelligence in classifying images effortlessly.
          </p>
          <p className="text-xl mt-6 font-semibold">Team Members:</p>
          <div className="flex justify-center space-x-8 text-lg mt-4">
            <span>Dang Ngoc Nam</span>
            <span>Nguyen Truong Anh Minh</span>
            <span>Chau Diem Hoang</span>
          </div>
          {isAuthenticated ? (
            <Link href="/home">
              <button className="btn btn-primary mt-8">Go to Homepage</button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <button className="btn btn-primary mt-8">Go to Login Page</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}