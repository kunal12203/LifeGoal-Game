'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const CATEGORIES = [
  { id: 'ML', name: 'Machine Learning', icon: '🤖', description: 'AI & Deep Learning' },
  { id: 'CP', name: 'Competitive Programming', icon: '💻', description: 'DSA & Algorithms' },
  { id: 'Health', name: 'Health & Fitness', icon: '💪', description: 'Gym & Wellness' },
  { id: 'Mind', name: 'Mindfulness', icon: '🧘', description: 'Meditation & Reading' },
  { id: 'Finance', name: 'Finance', icon: '💰', description: 'Money Management' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.updateUser);
  
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError('Please select at least one category');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authAPI.onboarding({ goal_categories: selected });
      // ✅ Fixed: Use has_completed_onboarding instead of needs_onboarding
      updateUser({ 
        goal_categories: selected, 
        has_completed_onboarding: true 
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Choose Your Quest Path
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Select 1-5 categories to focus on. Your daily quests will match these goals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                selected.includes(category.id)
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="text-white font-semibold">{category.name}</h3>
                  <p className="text-gray-400 text-sm">{category.description}</p>
                </div>
              </div>
              {selected.includes(category.id) && (
                <div className="text-purple-400 text-sm mt-2">✓ Selected</div>
              )}
            </button>
          ))}
        </div>

        <div className="text-center text-sm text-gray-400 mb-4">
          {selected.length} of 5 categories selected
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || selected.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Start Your Journey'}
        </button>
      </div>
    </div>
  );
}