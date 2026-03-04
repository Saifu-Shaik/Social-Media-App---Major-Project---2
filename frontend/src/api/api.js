import axios from "axios";

// Backend URL
const BASE_URL = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : "http://localhost:5000/api";

// Axios instance
const API = axios.create({
  baseURL: BASE_URL,
});

// Request Interceptor (Attach Token)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor (Handle Unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();

      // Notify app that auth changed
      window.dispatchEvent(new Event("auth-change"));
    }

    return Promise.reject(error);
  },
);

export default API;
