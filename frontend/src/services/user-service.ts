import apiClient from "./api-client";
import { UserResponse, DailyRunResponse, QuestResponse } from "@/types/api";

export const userService = {
  /**
   * Fetch detailed player profile and level progression
   */
  getProfile: async (): Promise<UserResponse & any> => {
    const response = await apiClient.get("/stats/profile");  // ✅ FIXED
    return response.data;
  },

  /**
   * Fetch the global Hall of Fame
   */
  getLeaderboard: async (limit: number = 10): Promise<any[]> => {
    const response = await apiClient.get(`/stats/leaderboard?limit=${limit}`);  // ✅ FIXED
    return response.data;
  },

  /**
   * Update goal categories during onboarding
   */
  completeOnboarding: async (categories: string[]): Promise<UserResponse> => {
    const response = await apiClient.post("/auth/onboarding", { goal_categories: categories });  // ✅ FIXED
    return response.data;
  }
};

export const questService = {
  /**
   * Initialize or fetch the current day's run
   */
  getTodaysRun: async (): Promise<DailyRunResponse> => {
    const response = await apiClient.get("/daily-runs/today");
    return response.data;
  },

  /**
   * Toggle a specific quest's completion status
   */
  toggleQuest: async (runId: string, completionId: string): Promise<any> => {
    const response = await apiClient.post(`/daily-runs/${runId}/complete-quest/${completionId}`);
    return response.data;
  },

  /**
   * Lock the daily run to confirm XP gains
   */
  completeRun: async (runId: string): Promise<any> => {
    const response = await apiClient.post(`/daily-runs/${runId}/complete`);
    return response.data;
  }
};