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
}));
