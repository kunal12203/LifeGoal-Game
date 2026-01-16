"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Lock, Star, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  is_completed: boolean;
  order: number;
}

interface QuestPathProps {
  milestones: Milestone[];
  currentGoalTitle: string;
}

export const QuestPath: React.FC<QuestPathProps> = ({ milestones, currentGoalTitle }) => {
  // Sort milestones by order
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="text-amber-400 w-5 h-5 fill-amber-400" />
            {currentGoalTitle}
          </h3>
          <p className="text-slate-400 text-sm">Follow the path to completion</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
          EPIC QUEST
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-12 py-4">
        {/* SVG Connector Path */}
        <div className="absolute top-0 bottom-0 w-1 bg-slate-800 left-1/2 -translate-x-1/2 z-0">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ 
              height: `${(sortedMilestones.filter(m => m.is_completed).length / sortedMilestones.length) * 100}%` 
            }}
            className="w-full bg-gradient-to-b from-emerald-500 to-indigo-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>

        {sortedMilestones.map((milestone, index) => {
          const isLast = index === sortedMilestones.length - 1;
          const isCompleted = milestone.is_completed;
          const isNext = !isCompleted && (index === 0 || sortedMilestones[index - 1].is_completed);

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 flex items-center w-full max-w-sm"
            >
              <div className={cn(
                "flex-1 text-right pr-6 transition-all duration-500",
                isCompleted ? "text-emerald-400" : isNext ? "text-white" : "text-slate-500"
              )}>
                <h4 className="font-bold text-sm leading-tight">{milestone.title}</h4>
                <p className="text-[10px] uppercase tracking-tighter opacity-60">
                  {isCompleted ? "Achieved" : isNext ? "Current Objective" : "Locked"}
                </p>
              </div>

              {/* Node Icon */}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                isCompleted 
                  ? "bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-slate-950" 
                  : isNext 
                  ? "bg-slate-800 border-indigo-500 text-indigo-400 animate-pulse" 
                  : "bg-slate-950 border-slate-800 text-slate-700"
              )}>
                {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : isLast ? <Flag className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="flex-1 pl-6" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};