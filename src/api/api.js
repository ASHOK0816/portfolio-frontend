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
    config.headers["Content-Type"] = "application/json";

    const loader = getLoaderHandler();

    // ✅ Bug 1 Fix: read skipLoader from config directly — axios preserves
    //    top-level custom keys on the config object in the request interceptor.
    //    The problem was in the RESPONSE interceptor (see below).
    if (!config.skipLoader) {
      loader.show("Please wait...");
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (token) {
      config.headers = config.headers || {};
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
  (response) => {
    const loader = getLoaderHandler();

    // ✅ Bug 1 Fix: axios DOES carry custom config keys on response.config —
    //    but only if you access them as response.config.skipLoader, not
    //    response.config?.params?.skipLoader. Was already correct here,
    //    the real issue was passing skipLoader wrongly at call sites (see note).
    if (!response.config?.skipLoader) {
      loader.hide();
    }

    return response;
  },
  (error) => {
    const loader = getLoaderHandler();
    loader.hide();

    // ✅ Bug 2 Fix: show a toast BEFORE redirecting so the user knows why.
    //    Also guard: only redirect on 401, not on network errors (status undefined).
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");

      // Give the toast time to render before navigating away
      import("react-toastify").then(({ toast }) => {
        toast.error("Session expired! Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      });

      return Promise.reject(error); // don't fall through
    }

    // ✅ Bug 2 Fix: surface network errors that were silently swallowed
    if (!error.response) {
      import("react-toastify").then(({ toast }) => {
        toast.error("Network error — is the server running?");
      });
    }

    return Promise.reject(error);
  }
);

export default api;