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
