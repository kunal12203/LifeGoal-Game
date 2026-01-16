import apiClient from "./api-client";

export const statsService = {
  getProfile: async () => {
    const response = await apiClient.get("/stats/profile");
    return response.data;
  },

  getStreaks: async () => {
    const response = await apiClient.get("/stats/streaks");
    return response.data;
  },

  getProgress: async (days: number = 30) => {
    const response = await apiClient.get(`/stats/progress?days=${days}`);
    return response.data;
  },

  getHeatmap: async (days: number = 90) => {
    const response = await apiClient.get(`/stats/heatmap?days=${days}`);
    return response.data;
  },
};