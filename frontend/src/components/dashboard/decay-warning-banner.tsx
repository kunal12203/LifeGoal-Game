"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingDown, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecayStatus {
  last_activity_date: string;
  days_until_decay: number;
  is_currently_safe: boolean;
  potential_decay: {
    will_decay: boolean;
    days_inactive?: number;
    xp_will_lose?: number;
    current_level?: number;
    level_after_decay?: number;
    will_drop_level?: boolean;
  };
}

interface DecayWarningBannerProps {
  decayStatus: DecayStatus | null;
}

export const DecayWarningBanner: React.FC<DecayWarningBannerProps> = ({ decayStatus }) => {
  if (!decayStatus || decayStatus.is_currently_safe) {
    return null;
  }

  const { potential_decay } = decayStatus;
  const willDropLevel = potential_decay.will_drop_level || false;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "w-full rounded-2xl p-4 border-2 backdrop-blur-md",
          willDropLevel
            ? "bg-rose-500/20 border-rose-500/50"
            : "bg-amber-500/20 border-amber-500/50"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              willDropLevel ? "bg-rose-500/30" : "bg-amber-500/30"
            )}
          >
            {willDropLevel ? (
              <Skull className="w-6 h-6 text-rose-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            )}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-bold text-lg mb-1",
                willDropLevel ? "text-rose-300" : "text-amber-300"
              )}
            >
              {willDropLevel ? "⚠️ CRITICAL: Level Drop Imminent!" : "⚠️ XP Decay Active"}
            </h3>
            <p className="text-sm text-slate-300 mb-3">
              You've been inactive for {potential_decay.days_inactive} day(s). 
              {willDropLevel && " You're about to lose a level!"}
            </p>

            {/* XP Loss Display */}
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  XP You'll Lose
                </p>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                  <span className="text-2xl font-black text-rose-400">
                    -{potential_decay.xp_will_lose?.toLocaleString()}
                  </span>
                </div>
              </div>

              {willDropLevel && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Level Drop
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-rose-400">
                      {potential_decay.current_level} → {potential_decay.level_after_decay}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div
              className={cn(
                "mt-3 px-3 py-2 rounded-lg text-sm font-bold",
                willDropLevel
                  ? "bg-rose-500/30 text-rose-200"
                  : "bg-amber-500/30 text-amber-200"
              )}
            >
              💪 Complete any quest TODAY to stop the decay!
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};