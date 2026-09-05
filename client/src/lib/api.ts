import axios from "axios";

/**
 * Shared Axios instance.
 * `withCredentials: true` ensures the httpOnly JWT cookie set by the
 * Express backend is sent on every request automatically.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Normalize error messages so components can just do err.message
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
