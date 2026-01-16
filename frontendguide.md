# Quest RPG Frontend Development Guide

Complete guide to developing the Quest RPG frontend with Next.js 14, TypeScript, and Tailwind CSS.

---

## 📁 Project Structure

```
frontend/
├── public/                        # Static assets
│   └── (icons, images, fonts)
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout with providers
│   │   ├── globals.css            # Tailwind + custom CSS variables
│   │   ├── page.tsx               # Landing/routing page
│   │   │
│   │   ├── (auth)/                # Auth route group
│   │   │   ├── login/page.tsx     # Login page
│   │   │   └── signup/page.tsx    # Signup page
│   │   │
│   │   ├── onboarding/            # Category selection
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/             # Main app interface
│   │   │   ├── page.tsx           # Bento grid dashboard
│   │   │   └── goals/page.tsx     # Epic quests view
│   │   │
│   │   └── stats/                 # Analytics
│   │       └── page.tsx
│   │
│   ├── components/                # React components
│   │   ├── dashboard/             # Dashboard-specific
│   │   │   ├── bento-grid.tsx
│   │   │   ├── quest-card.tsx
│   │   │   ├── xp-bar.tsx
│   │   │   └── quest-path.tsx
│   │   │
│   │   ├── shared/                # Reusable components
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── loading-spinner.tsx
│   │   │
│   │   └── ui/                    # Base UI primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── progress.tsx
│   │       └── badge.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-auth.ts            # Authentication logic
│   │   ├── use-dashboard.ts       # Dashboard data fetching
│   │   ├── use-goals.ts           # Goals management
│   │   └── use-toast.ts           # Toast notifications
│   │
│   ├── lib/                       # Core utilities
│   │   ├── api.ts                 # Axios client + API functions
│   │   ├── store.ts               # Zustand stores
│   │   ├── utils.ts               # Helper functions
│   │   └── validators.ts          # Zod schemas
│   │
│   └── types/                     # TypeScript definitions
│       ├── api.d.ts               # API response types
│       └── models.d.ts            # Core domain types
│
├── .env.local                     # Environment variables
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

---

## 🎨 Design System

### Color Palette (RPG Theme)

```css
/* globals.css */
:root {
  /* Background */
  --background: #0a0a0a;          /* Deep black */
  --surface: #1a1a1a;             /* Card background */
  --surface-elevated: #2a2a2a;    /* Hover states */
  
  /* Text */
  --foreground: #ededed;           /* Primary text */
  --muted: #a0a0a0;                /* Secondary text */
  
  /* Accent Colors */
  --primary: #10b981;              /* Emerald (success) */
  --primary-dark: #059669;
  --secondary: #8b5cf6;            /* Purple (magic) */
  --accent: #f59e0b;               /* Amber (XP) */
  
  /* Category Colors */
  --ml: #8b5cf6;                   /* Purple */
  --cp: #3b82f6;                   /* Blue */
  --health: #10b981;               /* Green */
  --mind: #eab308;                 /* Yellow */
  --finance: #f97316;              /* Orange */
  
  /* States */
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  
  /* Borders */
  --border: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.2);
}
```

### Typography

```typescript
// Tailwind classes
const typography = {
  h1: "text-4xl font-bold tracking-tight",
  h2: "text-3xl font-bold",
  h3: "text-2xl font-semibold",
  h4: "text-xl font-semibold",
  body: "text-base",
  small: "text-sm",
  xs: "text-xs",
  mono: "font-mono",
};
```

### Spacing Scale

```typescript
// Consistent spacing
const spacing = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  "2xl": "3rem",   // 48px
  "3xl": "4rem",   // 64px
};
```

---

## 🧩 Component Guidelines

### Component Structure

```typescript
// components/dashboard/quest-card.tsx

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Zap } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onToggle: (questId: string) => void;
  isCompleted: boolean;
}

export function QuestCard({ quest, onToggle, isCompleted }: QuestCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onToggle(quest.id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-5 rounded-2xl border transition-all cursor-pointer",
        isCompleted 
          ? "bg-emerald-500/10 border-emerald-500/50" 
          : "bg-slate-900 border-slate-800 hover:border-slate-600",
        isAnimating && "scale-105"
      )}
    >
      {/* Component content */}
    </div>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (`QuestCard`, `XpBar`)
- **Files**: kebab-case (`quest-card.tsx`, `xp-bar.tsx`)
- **Props Interfaces**: `ComponentNameProps`
- **Handlers**: `handle` prefix (`handleClick`, `handleSubmit`)
- **State**: Descriptive (`isLoading`, `questData`, `error`)

### Component Checklist

- ✅ TypeScript types defined
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Responsive (mobile-first)
- ✅ Loading states
- ✅ Error handling
- ✅ Optimistic updates where applicable

---

## 🪝 Custom Hooks

### `use-auth.ts`

```typescript
// hooks/use-auth.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { token, user, clearAuth } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !token) {
      router.push('/login');
    }
  }, [requireAuth, token, router]);

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return {
    user,
    token,
    isAuthenticated: !!token,
    logout,
  };
}
```

### `use-dashboard.ts`

```typescript
// hooks/use-dashboard.ts

import { useState, useEffect } from 'react';
import { dailyRunAPI } from '@/lib/api';
import { useGameStore } from '@/lib/store';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentRun, setCurrentRun } = useGameStore();

  useEffect(() => {
    fetchTodayRun();
  }, []);

  const fetchTodayRun = async () => {
    try {
      setLoading(true);
      const response = await dailyRunAPI.getToday();
      setCurrentRun(response.data);
    } catch (err) {
      setError('Failed to load today\'s run');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuest = async (completionId: string) => {
    if (!currentRun) return;

    // Optimistic update
    const updatedQuests = currentRun.quests.map(q =>
      q.completion_id === completionId
        ? { ...q, completed: !q.completed, xp_earned: !q.completed ? q.base_xp : 0 }
        : q
    );
    setCurrentRun({ ...currentRun, quests: updatedQuests });

    try {
      await dailyRunAPI.toggleQuest(currentRun.id, completionId);
      // Refetch to ensure sync
      await fetchTodayRun();
    } catch (err) {
      // Revert on error
      setError('Failed to toggle quest');
      await fetchTodayRun();
    }
  };

  const completeRun = async () => {
    if (!currentRun) return;

    try {
      await dailyRunAPI.completeRun(currentRun.id);
      await fetchTodayRun();
    } catch (err) {
      setError('Failed to complete run');
    }
  };

  return {
    run: currentRun,
    loading,
    error,
    toggleQuest,
    completeRun,
    refresh: fetchTodayRun,
  };
}
```

---

## 🌐 API Integration

### Axios Client Setup

```typescript
// lib/api.ts

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
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Functions

```typescript
// lib/api.ts (continued)

export const authAPI = {
  signup: (data: SignupData) =>
    api.post('/auth/signup', data),
  
  login: (data: LoginData) =>
    api.post('/auth/login', data),
  
  onboarding: (data: OnboardingData) =>
    api.post('/auth/onboarding', data),
  
  getMe: () => 
    api.get('/auth/me'),
};

export const dailyRunAPI = {
  getToday: () => 
    api.get('/daily-runs/today'),
  
  toggleQuest: (runId: string, completionId: string) =>
    api.post(`/daily-runs/${runId}/complete-quest/${completionId}`),
  
  completeRun: (runId: string) => 
    api.post(`/daily-runs/${runId}/complete`),
  
  getHistory: (limit = 30) => 
    api.get(`/daily-runs/history/all?limit=${limit}`),
};

export const statsAPI = {
  getProfile: () => 
    api.get('/stats/profile'),
  
  getStreaks: () => 
    api.get('/stats/streaks'),
  
  getProgress: (days = 30) => 
    api.get(`/stats/progress?days=${days}`),
};
```

---

## 🗂️ State Management

### Zustand Stores

```typescript
// lib/store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  total_xp: number;
  goal_categories: string[];
  needs_onboarding: boolean;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      
      setAuth: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ token, user });
      },
      
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ token: null, user: null });
      },
      
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Game Store
interface DailyRun {
  id: string;
  date: string;
  total_xp: number;
  is_perfect: boolean;
  is_locked: boolean;
  quests: QuestCompletion[];
}

interface GameStore {
  currentRun: DailyRun | null;
  setCurrentRun: (run: DailyRun) => void;
  clearCurrentRun: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentRun: null,
  setCurrentRun: (run) => set({ currentRun: run }),
  clearCurrentRun: () => set({ currentRun: null }),
}));
```

---

## 🎭 Page Examples

### Dashboard Page (Bento Grid)

```typescript
// app/dashboard/page.tsx

'use client';

import { useDashboard } from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { QuestCard } from '@/components/dashboard/quest-card';
import { XpBar } from '@/components/dashboard/xp-bar';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { run, loading, error, toggleQuest, completeRun } = useDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!run) return <div>No run found</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      {/* Header with user stats */}
      <header className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold">{user?.username}</h1>
        <XpBar 
          currentXp={user?.total_xp || 0}
          level={user?.level || 1}
        />
      </header>

      {/* Bento Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quest List (2 columns) */}
        <section className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Today's Quests</h2>
          {run.quests.map((quest) => (
            <QuestCard
              key={quest.completion_id}
              quest={quest}
              onToggle={() => toggleQuest(quest.completion_id)}
              isCompleted={quest.completed}
            />
          ))}
        </section>

        {/* Sidebar (1 column) */}
        <aside className="space-y-6">
          {/* Streak card */}
          {/* Goals preview */}
          {/* Complete button */}
          <button
            onClick={completeRun}
            disabled={run.is_locked}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 
                     disabled:opacity-50 rounded-lg font-bold"
          >
            {run.is_locked ? 'Day Complete' : 'Complete Day'}
          </button>
        </aside>
      </main>
    </div>
  );
}
```

---

## 🎨 Animations

### Framer Motion Examples

```typescript
// components/dashboard/quest-card.tsx (with animations)

import { motion } from 'framer-motion';

export function QuestCard({ quest, onToggle, isCompleted }: QuestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onToggle(quest.id)}
      className={cn(
        "p-5 rounded-2xl border cursor-pointer",
        isCompleted ? "bg-emerald-500/10" : "bg-slate-900"
      )}
    >
      {/* Content */}
    </motion.div>
  );
}
```

### CSS Animations

```css
/* globals.css */

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(16, 185, 129, 0.6);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Ultra-wide
};
```

### Mobile-First Approach

```tsx
<div className="
  p-4                    /* Mobile: 16px padding */
  md:p-6                 /* Tablet: 24px padding */
  lg:p-8                 /* Desktop: 32px padding */
  
  grid 
  grid-cols-1            /* Mobile: 1 column */
  md:grid-cols-2         /* Tablet: 2 columns */
  lg:grid-cols-3         /* Desktop: 3 columns */
  
  gap-4                  /* Mobile: 16px gap */
  md:gap-6               /* Tablet: 24px gap */
">
  {/* Content */}
</div>
```

---

## ♿ Accessibility

### ARIA Labels

```tsx
<button
  onClick={handleClick}
  aria-label="Complete quest: ML Core"
  aria-pressed={isCompleted}
>
  <CheckCircle2 aria-hidden="true" />
</button>
```

### Keyboard Navigation

```tsx
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  {/* Content */}
</div>
```

### Focus Styles

```css
/* globals.css */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

## 🧪 Testing

### Component Testing Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### Example Test

```typescript
// __tests__/components/quest-card.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { QuestCard } from '@/components/dashboard/quest-card';

describe('QuestCard', () => {
  const mockQuest = {
    id: '1',
    title: 'Test Quest',
    category: 'ML',
    base_xp: 200,
  };

  it('renders quest title', () => {
    render(<QuestCard quest={mockQuest} onToggle={jest.fn()} isCompleted={false} />);
    expect(screen.getByText('Test Quest')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const handleToggle = jest.fn();
    render(<QuestCard quest={mockQuest} onToggle={handleToggle} isCompleted={false} />);
    
    fireEvent.click(screen.getByText('Test Quest'));
    expect(handleToggle).toHaveBeenCalledWith('1');
  });
});
```

---

## 🚀 Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/stats/heavy-chart'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Client-side only
});
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/avatar.png"
  alt="User avatar"
  width={64}
  height={64}
  priority // Above the fold
/>
```

### Memoization

```typescript
import { useMemo } from 'react';

const totalXp = useMemo(() => {
  return quests.reduce((sum, quest) => sum + quest.xp_earned, 0);
}, [quests]);
```

---

## 🐛 Error Handling

### Error Boundary

```typescript
// components/shared/error-boundary.tsx

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**Happy coding! 🎮✨**