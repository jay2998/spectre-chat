import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axiosInstance";

export const useAuthStore = create((set) => ({
  currentUser: null,
  isLoggingIn: false,
  isCheckingAuth: true,

  setCurrentUser: (user) => set({ currentUser: user }),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ currentUser: res.data });
    } catch (error) {
      set({ currentUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ currentUser: res.data });
      toast.success(`Welcome, ${res.data.username}!`);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data || "Login failed");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ currentUser: null });
      toast.success("Logged out");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
      throw error;
    }
  },
}));
