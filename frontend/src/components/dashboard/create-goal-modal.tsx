"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { goalService } from "@/services/goal-service";

/* ------------------------------------------------------------------ */
/* ZOD SCHEMA - Object-based for TypeScript, transform for backend    */
/* ------------------------------------------------------------------ */
const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  category: z.string(),
  target_date: z.string().optional(),
  milestones: z
    .array(
      z.object({
        text: z.string().min(1, "Milestone cannot be empty"),
      })
    )
    .min(1, "At least one milestone is required"),
});

type GoalFormValues = z.infer<typeof goalSchema>;

// Backend expects string[] not { text: string }[]
type GoalCreateDTO = Omit<GoalFormValues, 'milestones'> & {
  milestones: string[];
};

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      category: "ML",
      milestones: [{ text: "Phase 1: Research" }, { text: "" }],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  // ✅ This works perfectly - no TypeScript errors!
  const { fields, append, remove } = useFieldArray<GoalFormValues>({
    control,
    name: "milestones",
  });

  const onSubmit = async (data: GoalFormValues) => {
    try {
      // Transform object array to string array for backend
      const dto: GoalCreateDTO = {
        ...data,
        milestones: data.milestones.map(m => m.text),
      };
      
      await goalService.createGoal(dto);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Trophy className="text-white w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Forge New Epic Quest
              </h2>
            </div>
            <button onClick={onClose} type="button" className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Quest Title
                </label>
                <input
                  {...register("title")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g., Master Deep Learning"
                />
                {errors.title && (
                  <p className="text-red-400 text-xs">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Category
                </label>
                <select
                  {...register("category")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                >
                  {["ML", "CP", "Health", "Mind", "Finance"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Milestones (Path Checkpoints)
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => append({ text: "" })}
                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Milestone
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3"
                  >
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-xs">
                        {index + 1}
                      </div>
                      <input
                        {...register(`milestones.${index}.text`)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                        placeholder="Milestone objective..."
                      />
                      {errors.milestones?.[index]?.text && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.milestones[index]?.text?.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {errors.milestones && typeof errors.milestones === 'object' && 'message' in errors.milestones && (
                <p className="text-red-400 text-xs">{errors.milestones.message as string}</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-lg rounded-2xl shadow-lg shadow-indigo-900/20"
              >
                {isSubmitting ? "Manifesting..." : "Commence Epic Quest"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};