import axios from "axios";
import { GetServerSidePropsContext } from "next";

let context: GetServerSidePropsContext | null = null;
export const setContext = (_context: GetServerSidePropsContext) => {
  context = _context;
};

const isServer = () => {
  return typeof window === "undefined";
};

export const getServerAppAxio = () => {
  const api = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (isServer()) return api;

  api.interceptors.request.use((config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log(error);
      return Promise.reject(error);
    }
  );

  return api;
};

export const getAIServerAxio = () => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_AI_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (isServer()) return api;

  api.interceptors.request.use((config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log(error);
      return Promise.reject(error);
    }
  );

  return api;
};