import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor — attach JWT token ────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hireloop_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle token expiry ───────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";

    // Auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("hireloop_token");
      localStorage.removeItem("hireloop_user");
      window.location.href = "/login";
    }

    return Promise.reject({ ...error, message });
  }
);

export default API;