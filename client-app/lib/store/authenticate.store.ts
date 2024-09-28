import { create } from "zustand";
import { User, UserSchema } from "../schema/data/user.schema";
import { api } from "../util/api";
import { tokenLogin } from "./authenticate.action";

interface AuthenticateStore {
  isAuthenticated?: boolean;
  user?: User | null;
  access_token?: string | null;
  refresh_token?: string | null;
  _initialized: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: User | null) => void;
  ensuredInitialized: () => Promise<void>;
  saveLoginToken: (access_token: string, refresh_token: string) => void;
}

const useAuthenticateStore = create<AuthenticateStore>((set, get) => ({
  isAuthenticated: undefined,
  _initialized: false,
  user: undefined,
  access_token: undefined,
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setUser: (user: User | null) => set({ user }),
  ensuredInitialized: async () => {
    const state = get();
    if (state._initialized) return;
    if (state.isAuthenticated !== undefined && state.user !== undefined) {
      set({ _initialized: true });
      return;
    }
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      set({ _initialized: true });
      set({ isAuthenticated: false });
      return;
    }
    try {
      const user = await tokenLogin(access_token);
      set({ user: user });
      set({ isAuthenticated: true });
    } catch (error) {
      set({ isAuthenticated: false });
    }
    set({ _initialized: true });
  },
  saveLoginToken: (access_token: string, refresh_token: string) => {
    localStorage.setItem("access_token", access_token);
    set({ access_token });
    localStorage.setItem("refresh_token", refresh_token);
  },
}));

export default useAuthenticateStore;
