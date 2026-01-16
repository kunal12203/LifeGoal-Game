import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('quest_token');  // ✅ Changed
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('quest_token');  // ✅ Changed
        localStorage.removeItem('quest_user');   // ✅ Added
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: { email: string; password: string; username: string }) =>
    api.post('/auth/signup', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  onboarding: (data: { goal_categories: string[] }) =>
    api.post('/auth/onboarding', data),
  
  getMe: () => api.get('/auth/me'),
};

// Quest API
export const questAPI = {
  getAll: () => api.get('/quests'),
  getCore: () => api.get('/quests/core'),
  getById: (id: string) => api.get(`/quests/${id}`),
  create: (data: any) => api.post('/quests', data),
};

// Daily Run API
export const dailyRunAPI = {
  startToday: (data?: { date?: string }) => api.post('/daily-runs/start', data),
  getToday: () => api.get('/daily-runs/today'),
  getById: (id: string) => api.get(`/daily-runs/${id}`),
  toggleQuest: (runId: string, completionId: string) =>
    api.post(`/daily-runs/${runId}/complete-quest/${completionId}`),
  completeRun: (runId: string) => api.post(`/daily-runs/${runId}/complete`),
  getHistory: (limit = 30) => api.get(`/daily-runs/history/all?limit=${limit}`),
};

// Stats API
export const statsAPI = {
  getProfile: () => api.get('/stats/profile'),
  getStreaks: () => api.get('/stats/streaks'),
  getProgress: (days = 30) => api.get(`/stats/progress?days=${days}`),
  getHeatmap: (days = 90) => api.get(`/stats/heatmap?days=${days}`),
  getLeaderboard: (limit = 10) => api.get(`/stats/leaderboard?limit=${limit}`),
};

// Goals API
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (data: {
    title: string;
    description?: string;
    category: string;
    target_date?: string;
    milestones: string[];
  }) => api.post('/goals', data),
  toggleMilestone: (milestoneId: string) =>
    api.post(`/goals/milestones/${milestoneId}/toggle`),
};