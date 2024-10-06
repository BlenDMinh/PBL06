"use client";

import useAuthenticateStore from "@/lib/store/authenticate.store";
import Link from "next/link";
import { Home01Icon, LaptopIcon } from "hugeicons-react";
import { handleLogout } from "@/app/actions";
import { useEffect, useState } from "react";
import { User } from "@/lib/schema/data/user.schema";

export default function Sidebar() {
  const authenticationStore = useAuthenticateStore((state) => state);
  const [isAuthenticated, setIsAuthenticated] = useState<
    boolean | null | undefined
  >(undefined);
  const [user, setUser] = useState<User | null | undefined>();
  useEffect(() => {
    const init = async () => {
      await authenticationStore.ensuredInitialized().then(() => {
        setIsAuthenticated(authenticationStore.isAuthenticated);
        setUser(authenticationStore.user);
      });
    };
    init();
  }, [authenticationStore]);
  return (
    <div className="sticky w-60 bg-base-300 flex flex-col items-center justify-between py-8">
      <Link href="/" className="font-bold text-secondary-content text-2xl">
        Logo
      </Link>
      <div className="flex flex-col justify-evenly grow items-start px-8 w-full">
        <Link href="/">
          <span className="flex items-center gap-5 text-primary text-xl font-bold btn btn-ghost">
            <Home01Icon size={32} />
            Home
          </span>
        </Link>
        <Link href="/">
          <span className="flex items-center gap-5 text-primary text-xl font-bold btn btn-ghost">
            <LaptopIcon size={32} />
            Devices
          </span>
        </Link>
      </div>
      <div className="w-full px-8">
        {isAuthenticated === undefined ? (
          <div className="flex items-center h-48 w-full">
            <div className="skeleton bg-secondary w-16 h-16 rounded-full"></div>
          </div>
        ) : isAuthenticated ? (
          <div className="flex items-center h-48 w-full">
            <div className="flex flex-col h-full items-start gap-1 text-white">
              <span className="text-base-content">
                Logged in as{" "}
                <span className="font-bold text-primary">{user?.username}</span>
              </span>
              <button
                className="hover:text-accent text-secondary transition-all"
                onClick={() => {
                  handleLogout();
                  authenticationStore.setIsAuthenticated(false);
                  authenticationStore.setUser(null);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="h-48">
            <Link href="/auth/login" className="btn btn-outline w-full">
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
