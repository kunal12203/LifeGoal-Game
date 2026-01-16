import api from "./api-client";

export const goalService = {
  getUserGoals: async () => {
    const response = await api.get("/goals");
    return response.data;
  },

  createGoal: async (goalData: any) => {
    const response = await api.post("/goals", goalData);
    return response.data;
  },

  updateGoal: async (goalId: string, updateData: any) => {
    const response = await api.put(`/goals/${goalId}`, updateData);
    return response.data;
  },

  deleteGoal: async (goalId: string) => {
    const response = await api.delete(`/goals/${goalId}`);
    return response.data;
  },

  toggleMilestone: async (milestoneId: string) => {
    const response = await api.post(`/goals/milestones/${milestoneId}/toggle`);
    return response.data;
  },

  addMilestone: async (goalId: string, title: string) => {
    const response = await api.post(`/goals/${goalId}/milestones`, { title });
    return response.data;
  },

  updateMilestone: async (milestoneId: string, title: string) => {
    const response = await api.put(`/goals/milestones/${milestoneId}`, { title });
    return response.data;
  },

  deleteMilestone: async (milestoneId: string) => {
    const response = await api.delete(`/goals/milestones/${milestoneId}`);
    return response.data;
  },
};