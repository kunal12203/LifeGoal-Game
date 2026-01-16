"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Star, Flag, MoreVertical, Pencil, Trash2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Milestone {
  id: string;
  title: string;
  is_completed: boolean;
  order: number;
}

interface QuestPathProps {
  goalId: string;
  milestones: Milestone[];
  currentGoalTitle: string;
  onToggleMilestone: (milestoneId: string) => void;
  onUpdateGoal: (title: string) => void;
  onDeleteGoal: () => void;
  onAddMilestone: (title: string) => void;
  onUpdateMilestone: (milestoneId: string, title: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
}

export const QuestPath: React.FC<QuestPathProps> = ({ 
  goalId,
  milestones, 
  currentGoalTitle,
  onToggleMilestone,
  onUpdateGoal,
  onDeleteGoal,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalTitleInput, setGoalTitleInput] = useState(currentGoalTitle);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneInput, setNewMilestoneInput] = useState("");

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  const handleSaveGoalTitle = () => {
    if (goalTitleInput.trim() && goalTitleInput !== currentGoalTitle) {
      onUpdateGoal(goalTitleInput.trim());
      toast.success("Goal updated!");
    }
    setIsEditingGoal(false);
  };

  const handleSaveMilestone = (milestoneId: string) => {
    if (milestoneInput.trim()) {
      onUpdateMilestone(milestoneId, milestoneInput.trim());
      toast.success("Milestone updated!");
    }
    setEditingMilestoneId(null);
    setMilestoneInput("");
  };

  const handleAddMilestone = () => {
    if (newMilestoneInput.trim()) {
      onAddMilestone(newMilestoneInput.trim());
      setNewMilestoneInput("");
      setIsAddingMilestone(false);
      toast.success("Milestone added!");
    }
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          {isEditingGoal ? (
            <div className="flex items-center gap-2">
              <Input
                value={goalTitleInput}
                onChange={(e) => setGoalTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveGoalTitle()}
                className="bg-slate-800 border-slate-700 text-white"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveGoalTitle} className="bg-emerald-600">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingGoal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="text-amber-400 w-5 h-5 fill-amber-400" />
                {currentGoalTitle}
              </h3>
              <p className="text-slate-400 text-sm">Follow the path to completion</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
            EPIC QUEST
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
              <DropdownMenuItem 
                onClick={() => setIsEditingGoal(true)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsAddingMilestone(true)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDeleteGoal}
                className="text-rose-500 hover:text-rose-400 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          const isEditing = editingMilestoneId === milestone.id;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 flex items-center w-full max-w-sm group"
            >
              <div className={cn(
                "flex-1 text-right pr-6 transition-all duration-500",
                isCompleted ? "text-emerald-400" : isNext ? "text-white" : "text-slate-500"
              )}>
                {isEditing ? (
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      value={milestoneInput}
                      onChange={(e) => setMilestoneInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveMilestone(milestone.id)}
                      className="bg-slate-800 border-slate-700 text-white text-sm"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleSaveMilestone(milestone.id)} className="bg-emerald-600">
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setEditingMilestoneId(null);
                        setMilestoneInput("");
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{milestone.title}</h4>
                      <p className="text-[10px] uppercase tracking-tighter opacity-60">
                        {isCompleted ? "Achieved" : isNext ? "Current Objective" : "Locked"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                        <DropdownMenuItem 
                          onClick={() => {
                            setEditingMilestoneId(milestone.id);
                            setMilestoneInput(milestone.title);
                          }}
                          className="text-slate-300 hover:text-white cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            onDeleteMilestone(milestone.id);
                            toast.success("Milestone deleted");
                          }}
                          className="text-rose-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Node Icon */}
              <button
                onClick={() => !isEditing && onToggleMilestone(milestone.id)}
                disabled={isEditing}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500",
                  isCompleted 
                    ? "bg-emerald-500 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] text-slate-950 cursor-pointer hover:scale-110" 
                    : isNext 
                    ? "bg-slate-800 border-indigo-500 text-indigo-400 animate-pulse cursor-pointer hover:scale-110" 
                    : "bg-slate-950 border-slate-800 text-slate-700 cursor-not-allowed"
                )}
              >
                {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : isLast ? <Flag className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </button>

              <div className="flex-1 pl-6" />
            </motion.div>
          );
        })}

        {/* Add New Milestone */}
        {isAddingMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex items-center w-full max-w-sm"
          >
            <div className="flex-1 text-right pr-6">
              <div className="flex items-center justify-end gap-2">
                <Input
                  value={newMilestoneInput}
                  onChange={(e) => setNewMilestoneInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMilestone()}
                  placeholder="New milestone..."
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={handleAddMilestone} className="bg-emerald-600">
                  <Check className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setIsAddingMilestone(false);
                    setNewMilestoneInput("");
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-700 text-slate-600">
              <Plus className="w-5 h-5" />
            </div>
            <div className="flex-1 pl-6" />
          </motion.div>
        )}
      </div>
    </div>
  );
};