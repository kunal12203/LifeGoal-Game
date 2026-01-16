"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sword, Lock, Trophy, Flame, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WeeklyChallengeStatus {
  challenge: {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    week_start: string;
    week_end: string;
  };
  status: {
    is_unlocked: boolean;
    is_completed: boolean;
    days_completed?: number;
    days_required?: number;
    unlocked_at?: string;
  };
}

interface WeeklyChallengeCardProps {
  challengeData: WeeklyChallengeStatus | null;
  onComplete: () => void;
  isCompleting?: boolean;
}

export const WeeklyChallengeCard: React.FC<WeeklyChallengeCardProps> = ({
  challengeData,
  onComplete,
  isCompleting = false,
}) => {
  if (!challengeData) {
    return null;
  }

  const { challenge, status } = challengeData;
  const isUnlocked = status.is_unlocked;
  const isCompleted = status.is_completed;
  const progress = status.days_completed || 0;
  const required = status.days_required || 5;

  return (
    <div className="w-full relative overflow-hidden">
      {/* Background glow effect */}
      {isUnlocked && !isCompleted && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 blur-xl"
        />
      )}

      <div
        className={cn(
          "relative bg-slate-900/60 border rounded-3xl p-6 backdrop-blur-md transition-all",
          isUnlocked && !isCompleted
            ? "border-amber-500/50 shadow-lg shadow-amber-500/20"
            : isCompleted
            ? "border-emerald-500/30"
            : "border-slate-800"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Check className="w-6 h-6 text-emerald-400" />
              </div>
            ) : isUnlocked ? (
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30"
              >
                <Sword className="w-6 h-6 text-amber-400" />
              </motion.div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                <Lock className="w-6 h-6 text-slate-500" />
              </div>
            )}

            <div>
              <h3
                className={cn(
                  "font-bold text-lg",
                  isUnlocked && !isCompleted ? "text-amber-300" : "text-slate-200"
                )}
              >
                Weekly Boss Battle
              </h3>
              <p className="text-xs text-slate-400">
                {new Date(challenge.week_start).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })} -{" "}
                {new Date(challenge.week_end).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* XP Reward Badge */}
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border",
              isUnlocked && !isCompleted
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : isCompleted
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            )}
          >
            <Trophy className="w-3 h-3" />
            {challenge.xp_reward} XP
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 mb-4">{challenge.description}</p>

        {/* Status Content */}
        {isCompleted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <p className="text-emerald-400 font-bold text-center">
              ✨ Challenge Complete! +{challenge.xp_reward} XP earned
            </p>
          </div>
        ) : isUnlocked ? (
          <div className="space-y-3">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-300 font-bold text-sm mb-2">🔥 BOSS UNLOCKED!</p>
              <p className="text-amber-200/80 text-xs">
                You completed all core quests Mon-Fri. Complete this challenge to earn massive XP!
              </p>
            </div>
            <Button
              onClick={onComplete}
              disabled={isCompleting}
              className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg rounded-xl shadow-lg shadow-amber-500/20"
            >
              {isCompleting ? (
                <>
                  <Flame className="w-5 h-5 mr-2 animate-spin" />
                  Fighting Boss...
                </>
              ) : (
                <>
                  <Sword className="w-5 h-5 mr-2" />
                  Fight Boss Battle
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Complete ALL core quests Mon-Fri</span>
                <span>
                  {progress}/{required} days
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress / required) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-slate-600 to-slate-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
              <p className="text-xs text-slate-400 text-center">
                🔒 Locked: Complete all core quests Monday through Friday to unlock
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};