import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  total_xp: number;
  current_level: number;
  goal_categories: string[];
  has_completed_onboarding: boolean;  // ✅ Fixed field name
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUserXp: (newXp: number, newLevel: number) => void;
  updateUser: (updates: Partial<User>) => void;  // ✅ Added
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        // ✅ CRITICAL FIX: Save to localStorage for axios interceptors
        if (typeof window !== 'undefined') {
          localStorage.setItem('quest_token', token);
          localStorage.setItem('quest_user', JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        // ✅ Clear both localStorage and state
        if (typeof window !== 'undefined') {
          localStorage.removeItem('quest_token');
          localStorage.removeItem('quest_user');
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUserXp: (newXp, newLevel) => set((state) => ({
        user: state.user ? { ...state.user, total_xp: newXp, current_level: newLevel } : null
      })),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),  // ✅ Added
    }),
    {
      name: 'quest-auth-storage',
    }
  )
);