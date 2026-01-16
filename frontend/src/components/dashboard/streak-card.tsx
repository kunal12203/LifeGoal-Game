"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface Streak {
  quest_id: string;
  quest_title: string;
  quest_category: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  is_active: boolean;
}

interface StreakCardProps {
  streaks: Streak[];
}

export const StreakCard: React.FC<StreakCardProps> = ({ streaks }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [hoursLeft, setHoursLeft] = useState<number>(24);

  // Calculate time until midnight
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setHoursLeft(hours);
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Get highest active streak
  const highestStreak = streaks.reduce((max, streak) => 
    streak.is_active && streak.current_streak > max.current_streak ? streak : max
  , { current_streak: 0, quest_title: "", quest_category: "" } as Streak);

  // Get longest ever streak
  const longestEver = streaks.reduce((max, streak) => 
    streak.longest_streak > max ? streak.longest_streak : max
  , 0);

  // Get active streaks count
  const activeStreaksCount = streaks.filter(s => s.is_active && s.current_streak > 0).length;

  const isDanger = hoursLeft < 4;
  const isWarning = hoursLeft < 8 && hoursLeft >= 4;

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
      {/* Background glow effect */}
      {isDanger && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent"
        />
      )}

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <motion.div
              animate={isDanger ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Flame className={cn(
                "w-6 h-6",
                isDanger ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"
              )} />
            </motion.div>
            <h3 className="text-lg font-bold">Streak Tracker</h3>
          </div>
          
          {/* Time remaining badge */}
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border",
            isDanger 
              ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse" 
              : isWarning 
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30" 
              : "bg-slate-800 text-slate-400 border-slate-700"
          )}>
            <Clock className="w-3 h-3" />
            {timeLeft}
          </div>
        </div>

        {/* Warning Messages */}
        {isDanger && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl"
          >
            <p className="text-rose-400 text-sm font-bold flex items-center gap-2">
              ⚠️ Streak expires in {timeLeft}! Complete your quests now.
            </p>
          </motion.div>
        )}

        {isWarning && !isDanger && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl"
          >
            <p className="text-amber-400 text-sm font-medium">
              🔥 Don't break your streak! {timeLeft} remaining.
            </p>
          </motion.div>
        )}

        {/* Main Streak Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Current Highest Streak */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Current</span>
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {highestStreak.current_streak}
            </div>
            {highestStreak.current_streak > 0 && (
              <p className="text-xs text-slate-500 mt-1 truncate">
                {highestStreak.quest_title}
              </p>
            )}
          </div>

          {/* Longest Ever Streak */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Record</span>
            </div>
            <div className="text-3xl font-black text-amber-400">
              {longestEver}
            </div>
            <p className="text-xs text-slate-500 mt-1">Personal Best</p>
          </div>
        </div>

        {/* Active Streaks List */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Active Streaks ({activeStreaksCount})
            </span>
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {streaks
              .filter(s => s.is_active && s.current_streak > 0)
              .sort((a, b) => b.current_streak - a.current_streak)
              .map((streak) => (
                <div
                  key={streak.quest_id}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {streak.quest_title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {streak.quest_category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-emerald-500" />
                    <span className="text-lg font-bold text-emerald-400">
                      {streak.current_streak}
                    </span>
                  </div>
                </div>
              ))}

            {activeStreaksCount === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No active streaks. Complete core quests to start!
              </div>
            )}
          </div>
        </div>

        {/* Broken Streaks Warning */}
        {streaks.some(s => !s.is_active && s.longest_streak > s.current_streak && s.longest_streak > 0) && (
          <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700 rounded-xl">
            <p className="text-xs text-slate-400">
              💔 You had {streaks.filter(s => !s.is_active && s.longest_streak > s.current_streak).length} broken streak(s). 
              Don't let it happen again!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};