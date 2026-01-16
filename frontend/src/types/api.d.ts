import { QuestCategory, QuestDifficulty } from "./enums";

// Auth Types
export interface UserLogin {
  email: string;
  password: string;
}

export interface UserCreate {
  email: string;
  password: string;
  username: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  total_xp: number;
  current_level: number;
  goal_categories: string[];
  has_completed_onboarding: boolean;
  needs_onboarding?: boolean; // Alias for has_completed_onboarding
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user: UserResponse;
}

// Quest Types
export interface QuestResponse {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  base_xp: number;
  is_core: boolean;
  is_active: boolean;
  created_at: string;
}

export interface QuestCompletionResponse {
  completion_id: string;
  quest_id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  base_xp: number;
  is_core: boolean;
  completed: boolean;
  xp_earned: number;
  completed_at?: string;
}

// Daily Run Types
export interface DailyRunResponse {
  id: string;
  user_id: string;
  date: string;
  total_xp: number;
  is_perfect: boolean;
  is_locked: boolean;
  completed_at?: string;
  created_at: string;
  quests: QuestCompletionResponse[];
}

// Goal Types
export interface MilestoneResponse {
  id: string;
  title: string;
  order: number;
  is_completed: boolean;
}

export interface GoalCreate {
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  milestones: string[];
}

export interface GoalResponse {
  id: string;
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  is_completed: boolean;
  progress_percentage: number;
  milestones: MilestoneResponse[];
  created_at: string;
}

// Stats Types
export interface StatsResponse {
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  level_progress: number;
  total_quests_completed: number;
  current_streak: number;
  longest_streak: number;
  perfect_days: number;
}

// Export enum types
export { QuestCategory, QuestDifficulty };