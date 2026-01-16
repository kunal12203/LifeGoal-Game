import apiClient from "./api-client";
import { UserLogin, UserCreate, TokenResponse } from "@/types/api";

export const authService = {
  /**
   * Register a new adventurer
   */
  register: async (data: UserCreate): Promise<TokenResponse> => {
    const response = await apiClient.post("/auth/register", data);
    if (response.data.access_token) {
      localStorage.setItem("quest_token", response.data.access_token);
      localStorage.setItem("quest_user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Log in to an existing account
   */
  login: async (data: UserLogin): Promise<TokenResponse> => {
    const response = await apiClient.post("/auth/login", data);
    if (response.data.access_token) {
      localStorage.setItem("quest_token", response.data.access_token);
      localStorage.setItem("quest_user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Terminate the session
   */
  logout: () => {
    localStorage.removeItem("quest_token");
    localStorage.removeItem("quest_user");
    window.location.href = "/login";
  },

  /**
   * Get the current user from local storage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem("quest_user");
    return user ? JSON.parse(user) : null;
  }
};