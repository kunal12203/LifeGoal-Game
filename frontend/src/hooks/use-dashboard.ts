"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questService } from "@/services/quest-service";
import { goalService } from "@/services/goal-service";
import { userService } from "@/services/user-service";
import { toast } from "sonner"; // Assuming sonner for RPG-style notifications

export const useDashboard = () => {
  const queryClient = useQueryClient();

  // 1. Fetch User Profile & XP Stats
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile(),
  });

  // 2. Fetch Today's Daily Run
  const { data: dailyRun, isLoading: isRunLoading } = useQuery({
    queryKey: ["daily-run", "today"],
    queryFn: () => questService.getTodaysRun(),
  });

  // 3. Fetch Active Epic Quests (Goals)
  const { data: goals, isLoading: isGoalsLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => goalService.getUserGoals(),
  });

  // 4. Mutation: Toggle Daily Quest Completion
  const toggleQuestMutation = useMutation({
    mutationFn: ({ runId, completionId }: { runId: string; completionId: string }) =>
      questService.toggleQuest(runId, completionId),
    
    // Optimistic Update for instant XP feedback
    onMutate: async ({ completionId }) => {
      await queryClient.cancelQueries({ queryKey: ["daily-run", "today"] });
      const previousRun = queryClient.getQueryData(["daily-run", "today"]);

      queryClient.setQueryData(["daily-run", "today"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          quests: old.quests.map((q: any) =>
            q.completion_id === completionId ? { ...q, completed: !q.completed } : q
          ),
        };
      });

      return { previousRun };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["daily-run", "today"], context?.previousRun);
      toast.error("Action failed. The forces of chaos prevail.");
    },
    onSuccess: (data) => {
      if (data.completed) toast.success(`Quest Complete! +${data.xp_earned} XP`);
      queryClient.invalidateQueries({ queryKey: ["daily-run", "today"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] }); // Refresh level/XP
    },
  });

  // 5. Mutation: Complete (Lock) the Daily Run
  const completeRunMutation = useMutation({
    mutationFn: (runId: string) => questService.completeRun(runId),
    onSuccess: () => {
      toast.success("Daily Run Locked! Leveling up...");
      queryClient.invalidateQueries({ queryKey: ["daily-run", "today"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "You cannot lock this run yet.");
    }
  });

  return {
    // Data
    profile,
    dailyRun,
    activeGoal: goals?.[0], // Focus on the most recent Epic Quest
    
    // States
    isLoading: isProfileLoading || isRunLoading || isGoalsLoading,
    
    // Actions
    toggleQuest: (completionId: string) => {
      if (dailyRun) {
        toggleQuestMutation.mutate({ runId: dailyRun.id, completionId });
      }
    },
    completeRun: () => {
      if (dailyRun) completeRunMutation.mutate(dailyRun.id);
    },
  };
};