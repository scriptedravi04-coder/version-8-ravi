import axios from "axios";

export const API = "/api";

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Attach Bearer token if present in localStorage
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("ybex_token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;

api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      return Promise.reject(new Error("Received HTML instead of expected JSON"));
    }
    return response;
  },
  (error) => Promise.reject(error)
);
