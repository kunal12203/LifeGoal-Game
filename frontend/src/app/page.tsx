'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      // ✅ Fixed: Check has_completed_onboarding instead of needs_onboarding
      if (!user.has_completed_onboarding) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [token, user, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
}