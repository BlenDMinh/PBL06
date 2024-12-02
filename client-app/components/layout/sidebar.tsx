"use client";

import useAuthenticateStore from "@/lib/store/authenticate.store";
import Link from "next/link";
import { Home01Icon, LaptopIcon, Menu01Icon } from "hugeicons-react";
import { handleLogout } from "@/app/actions";
import { useEffect, useState } from "react";
import { User } from "@/lib/schema/data/user.schema";
import SidebarItem from "@/components/layout/sidebar_item";
import Loader from "@/components/layout/loader";

export default function Sidebar() {
  const authenticationStore = useAuthenticateStore((state) => state);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null | undefined>(undefined);
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

  if (isAuthenticated === undefined) {
    return <Loader />;
  }

  return (
    <div className="sticky w-60 bg-base-300 flex flex-col items-center justify-between py-8 h-screen">
      <Link href="/" className="font-bold text-secondary-content text-2xl mb-8">
        Logo
      </Link>
      <div className="flex flex-col justify-center grow items-start px-8 w-full">
        {/* <SidebarItem href="/" icon={<Home01Icon size={32} />} active={false}>
          Home
        </SidebarItem>
        <SidebarItem href="/devices" icon={<LaptopIcon size={32} />} active={false}>
          Devices
        </SidebarItem> */}
        {isAuthenticated && (
          <SidebarItem href="/history" icon={<Menu01Icon size={32} />} active={false}>
            History
          </SidebarItem>
        )}
      </div>
      <div className="w-full mt-auto px-8">
        {isAuthenticated === undefined ? (
          <div className="flex items-center h-48 w-full">
            <div className="skeleton bg-secondary w-16 h-16 rounded-full"></div>
          </div>
        ) : isAuthenticated ? (
          <div className="flex flex-col h-full items-start gap-1 text-white">
            <div className="flex items-center gap-2">
              <span className="text-base-content">
                Hello, <span className="font-bold text-primary">{user?.username}</span>
              </span>
            </div>
            <button
              className="btn btn-outline w-full mt-4"
              onClick={() => {
                handleLogout();
                authenticationStore.setIsAuthenticated(false);
                authenticationStore.setUser(null);
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="btn btn-outline w-full">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}