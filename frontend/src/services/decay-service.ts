import apiClient from "./api-client";

export const decayService = {
  getDecayStatus: async () => {
    const response = await apiClient.get("/decay/status");
    return response.data;
  },

  getDecayHistory: async (limit: number = 30) => {
    const response = await apiClient.get(`/decay/history?limit=${limit}`);
    return response.data;
  },

  triggerDecayManually: async () => {
    const response = await apiClient.post("/decay/run-all");
    return response.data;
  },
};