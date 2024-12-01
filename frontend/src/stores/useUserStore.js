import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password != confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }
    try {
      const res = await axios.post("/auth/signup", {
        name,
        email,
        password,
      });
      set({ user: res.data, loading: false });
      toast.success("User created successfully");
    } catch (error) {
      set({ loading: false });
      console.log(error.response);
      return toast.error(
        error.response.data.error ||
          error.response.data.message ||
          "Something went wrong try again later"
      );
    }
  },
  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
      });
      set({ user: res.data });
      console.log(res.data);
      toast.success("Logged in successfully");
    } catch (error) {
      console.log(error.response);
      toast.error(
        error.response.data.error ||
          error.response.data.message ||
          "Something went wrong try again later"
      );
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      toast.success("Logged out successfully");
      set({ user: null });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong try again later"
      );
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data });
    } catch (error) {
      set({ user: null });
    } finally {
      set({ checkingAuth: false });
    }
  },
  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));

let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
