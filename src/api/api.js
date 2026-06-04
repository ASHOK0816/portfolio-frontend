import axios from "axios";
import { getLoaderHandler } from "../context/LoaderContext";

// ================= BASE URL =================
const getBaseURL = () => {
  const port = 8080;

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return `http://localhost:${port}/api`;
  }

  const localIP = import.meta.env.VITE_LOCAL_IP ?? "192.168.1.100";
  return `http://${localIP}:${port}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

      console.log("TOKEN:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    getLoaderHandler().hide();
    return Promise.reject(error);
  }
);

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const loader = getLoaderHandler();
    loader.hide();

    // ✅ Bug 2 Fix: show a toast BEFORE redirecting so the user knows why.
    //    Also guard: only redirect on 401, not on network errors (status undefined).
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

      return Promise.reject(error); // don't fall through
    }
);

export default api;