import axios from "axios";

const api = axios.create({
  baseURL: "https://bisho-backend-2.onrender.com/api",
  withCredentials: true, 
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    console.log("[API Request]", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("[API Response]", response.status, response.config.url);
    return response;
  },
  (error) => {
    const isAuthError = error.response?.status === 401;
    const isBrowser = typeof window !== "undefined";
    const pathname = isBrowser ? window.location.pathname : "";

    const isSafeToRedirect =
      pathname !== "/login" &&
      !pathname.startsWith("/.well-known") &&
      !pathname.match(/\.(js|json|css|map|ico|png|jpg|jpeg)$/);

    console.error("[API Error]", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    if (isAuthError && isBrowser && isSafeToRedirect) {
      console.warn("[API] Unauthorized - redirecting to login");
      window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (identifier: string, password: string) => {
    const response = await api.post("/auth/login", { identifier, password });
    return { user: response.data }; 
  },

  logout: async () => {
    const response = await api.get("/auth/logout");
    return response.data;
  },
};

export const dashboardAPI = {
  getDashboardData: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },
};

export const membersAPI = {
  getMember: async (etNumber: string) => {
    const response = await api.get(`/members/${etNumber}`);
    return response.data;
  },
};

export default api;
