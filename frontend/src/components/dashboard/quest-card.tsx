"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  title: string;
  category: string;
  xp: number;
  difficulty: string;
  completed: boolean;
  onToggle: () => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ 
  title, category, xp, difficulty, completed, onToggle 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        "group relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden",
        completed 
          ? "bg-emerald-500/5 border-emerald-500/30" 
          : "bg-slate-900/80 border-slate-800 hover:border-slate-600"
      )}
    >
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
            completed ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
          )}>
            {completed ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-5 h-5" />}
          </div>
          <div>
            <h3 className={cn(
              "font-bold text-sm transition-all",
              completed ? "text-emerald-400/60 line-through" : "text-slate-100"
            )}>
              {title}
            </h3>
            <div className="flex gap-2 mt-1">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700 uppercase tracking-wider">
                {category}
              </span>
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                difficulty === 'Hard' ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
              )}>
                {difficulty}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="block font-mono font-black text-emerald-400">+{xp}</span>
          <span className="text-[8px] text-slate-500 uppercase font-bold">XP</span>
        </div>
      </div>
      
      {/* Background glow for active items */}
      {!completed && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  );
};