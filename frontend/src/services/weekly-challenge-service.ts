import apiClient from "./api-client";

export const weeklyChallengeService = {
  getCurrentChallenge: async () => {
    const response = await apiClient.get("/weekly-challenge/current");
    return response.data;
  },

  completeChallenge: async (challengeId: string) => {
    const response = await apiClient.post(`/weekly-challenge/complete/${challengeId}`);
    return response.data;
  },

  checkUnlock: async () => {
    const response = await apiClient.post("/weekly-challenge/check-unlock");
    return response.data;
  },

  getHistory: async (limit: number = 10) => {
    const response = await apiClient.get(`/weekly-challenge/history?limit=${limit}`);
    return response.data;
  },
};