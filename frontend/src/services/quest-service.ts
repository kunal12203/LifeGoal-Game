import apiClient from "./api-client";
import { DailyRunResponse, QuestResponse, QuestCompletionResponse } from "@/types/api";

export const questService = {
  /**
   * Initialize or fetch the current day's run
   */
  getTodaysRun: async (): Promise<DailyRunResponse> => {
    const response = await apiClient.get("/daily-runs/today");
    return response.data;
  },

  /**
   * Start a new daily run (if not already started)
   */
  startDailyRun: async (data?: { date?: string }): Promise<DailyRunResponse> => {
    const response = await apiClient.post("/daily-runs/start", data || {});
    return response.data;
  },

  /**
   * Toggle a specific quest's completion status
   */
  toggleQuest: async (runId: string, completionId: string): Promise<QuestCompletionResponse> => {
    const response = await apiClient.post(
      `/daily-runs/${runId}/complete-quest/${completionId}`
    );
    return response.data;
  },

  /**
   * Lock the daily run to confirm XP gains
   */
  completeRun: async (runId: string): Promise<DailyRunResponse> => {
    const response = await apiClient.post(`/daily-runs/${runId}/complete`);
    return response.data;
  },

  /**
   * Get daily run history
   */
  getHistory: async (limit: number = 30): Promise<DailyRunResponse[]> => {
    const response = await apiClient.get(`/daily-runs/history/all?limit=${limit}`);
    return response.data;
  },

  /**
   * Get all available quests
   */
  getAllQuests: async (): Promise<QuestResponse[]> => {
    const response = await apiClient.get("/quests");
    return response.data;
  },

  /**
   * Get core quests only
   */
  getCoreQuests: async (): Promise<QuestResponse[]> => {
    const response = await apiClient.get("/quests/core");
    return response.data;
  },

  /**
   * Get quest by ID
   */
  getQuestById: async (questId: string): Promise<QuestResponse> => {
    const response = await apiClient.get(`/quests/${questId}`);
    return response.data;
  },
};