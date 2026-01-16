"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, LayoutDashboard, Target, Trophy, 
  Settings, LogOut, ChevronRight, Loader2 
} from "lucide-react";
import Link from "next/link";

// Custom Components & Hooks
import { useDashboard } from "@/hooks/use-dashboard";
import { QuestCard } from "@/components/dashboard/quest-card";
import { QuestPath } from "@/components/dashboard/quest-path";
import { LevelUpOverlay } from "@/components/dashboard/level-up-overlay";
import { CreateGoalModal } from "@/components/dashboard/create-goal-modal";
import { authService } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { 
    profile, 
    dailyRun, 
    activeGoal, 
    isLoading, 
    toggleQuest, 
    completeRun 
  } = useDashboard();

  // UI State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastLevel, setLastLevel] = useState<number | null>(null);

  // Level-Up Detection Logic
  useEffect(() => {
    if (profile?.current_level) {
      if (lastLevel !== null && profile.current_level > lastLevel) {
        setShowLevelUp(true);
      }
      setLastLevel(profile.current_level);
    }
  }, [profile?.current_level, lastLevel]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-20 lg:w-64 border-r border-slate-900 bg-slate-950/50 backdrop-blur-xl flex flex-col p-4 z-20">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Trophy className="text-slate-950 w-6 h-6" />
          </div>
          <span className="hidden lg:block font-black tracking-tighter text-xl uppercase italic">Quest RPG</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden lg:block">Command Center</span>
            </Button>
          </Link>
          <Link href="/stats">
            <Button variant="ghost" className="w-full justify-start gap-4 text-slate-400 hover:text-white">
              <Target className="w-5 h-5" />
              <span className="hidden lg:block">Hall of Fame</span>
            </Button>
          </Link>
        </nav>

        <Button 
          variant="ghost" 
          onClick={() => authService.logout()} 
          className="w-full justify-start gap-4 text-rose-500 hover:bg-rose-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:block">Retire Hero</span>
        </Button>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
          
          {/* TOP BAR: XP & PROFILE */}
          <header className="flex flex-col lg:flex-row gap-6 items-center bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center font-black text-2xl shadow-lg">
                {profile?.username?.[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black">{profile?.username}</h2>
                <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Level {profile?.current_level}</p>
              </div>
            </div>

            {/* Glowing XP Bar */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-slate-500">
                <span>XP Progress</span>
                <span>{profile?.level_progress_percentage}% to Level {profile?.current_level + 1}</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${profile?.level_progress_percentage}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-emerald-300 to-indigo-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </header>

          {/* BENTO GRID: Quests and Epic Path */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Center Columns: Daily Quests */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                  Today's Active Quests
                </h3>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </div>
              </div>

              <div className="grid gap-4">
                {dailyRun?.quests.map((quest: any) => (
                  <QuestCard 
                    key={quest.completion_id}
                    title={quest.title}
                    category={quest.category}
                    xp={quest.base_xp}
                    difficulty={quest.difficulty}
                    completed={quest.completed}
                    onToggle={() => toggleQuest(quest.completion_id)}
                  />
                ))}
              </div>

              <Button 
                onClick={completeRun}
                disabled={dailyRun?.is_locked}
                className={cn(
                  "w-full py-8 rounded-2xl text-lg font-black uppercase tracking-widest transition-all",
                  dailyRun?.is_locked 
                    ? "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                )}
              >
                {dailyRun?.is_locked ? "Run Finalized" : "Complete Daily Run"}
              </Button>
            </div>

            {/* Right Column: Epic Quest Path */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Epic Path</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsGoalModalOpen(true)}
                  className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                >
                  <Plus className="w-4 h-4 mr-1" /> New Goal
                </Button>
              </div>

              {activeGoal ? (
                <QuestPath 
                  milestones={activeGoal.milestones} 
                  currentGoalTitle={activeGoal.title} 
                />
              ) : (
                <div className="p-10 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-600">
                    <Target className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 text-sm">No active Epic Quest. Forge one to start your journey.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAYS & MODALS */}
      <LevelUpOverlay 
        newLevel={profile?.current_level || 1} 
        isOpen={showLevelUp} 
        onClose={() => setShowLevelUp(false)} 
      />

      <CreateGoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)}
        onSuccess={() => {/* Refetched automatically by react-query */}}
      />
    </div>
  );
}