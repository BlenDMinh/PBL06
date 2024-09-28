import axios, { AxiosHeaders } from "axios";
import { GetServerSidePropsContext } from "next";

let context: GetServerSidePropsContext | null = null;
export const setContext = (_context: GetServerSidePropsContext) => {
  context = _context;
};

const isServer = () => {
  return typeof window === "undefined";
};

export const api = axios.create({
  baseURL: process.env.LOCAL_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function axiosInitialize() {
  await api.interceptors.request.use((config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  });

  await api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log(error);
      // if (error.response.status === 401) {
      //   // refresh token

      //   console.log("refresh token");
      // }
      return Promise.reject(error);
    }
  );
}
