import apiClient from "./api-client";
import { GoalCreate, GoalResponse, MilestoneResponse } from "@/types/api";

export const goalService = {
  /**
   * Fetch all user goals
   */
  getUserGoals: async (): Promise<GoalResponse[]> => {
    const response = await apiClient.get("/goals/");  // ✅ Added trailing slash
    return response.data;
  },

  /**
   * Create a new epic quest (goal)
   */
  createGoal: async (data: GoalCreate): Promise<GoalResponse> => {
    const response = await apiClient.post("/goals/", data);  // ✅ Added trailing slash
    return response.data;
  },

  /**
   * Toggle milestone completion status
   */
  toggleMilestone: async (milestoneId: string): Promise<MilestoneResponse> => {
    const response = await apiClient.post(`/goals/milestones/${milestoneId}/toggle`);
    return response.data;
  },

  /**
   * Delete a goal
   */
  deleteGoal: async (goalId: string): Promise<void> => {
    const response = await apiClient.delete(`/goals/${goalId}`);
    return response.data;
  },

  /**
   * Update a goal
   */
  updateGoal: async (goalId: string, data: Partial<GoalCreate>): Promise<GoalResponse> => {
    const response = await apiClient.put(`/goals/${goalId}`, data);
    return response.data;
  },

  /**
   * Get a single goal by ID
   */
  getGoalById: async (goalId: string): Promise<GoalResponse> => {
    const response = await apiClient.get(`/goals/${goalId}`);
    return response.data;
  },
};