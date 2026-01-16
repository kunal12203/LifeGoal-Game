"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questService } from "@/services/quest-service";
import { goalService } from "@/services/goal-service";
import { userService } from "@/services/user-service";
import { statsService } from "@/services/stats-service";
import { decayService } from "@/services/decay-service";
import { weeklyChallengeService } from "@/services/weekly-challenge-service";
import { toast } from "sonner";

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

  // 4. Fetch Streaks
  const { data: streaks, isLoading: isStreaksLoading } = useQuery({
    queryKey: ["streaks"],
    queryFn: () => statsService.getStreaks(),
  });

  // 5. Fetch Decay Status
  const { data: decayStatus } = useQuery({
    queryKey: ["decay-status"],
    queryFn: () => decayService.getDecayStatus(),
    refetchInterval: 60000, // Check every minute
  });

  // 6. Fetch Weekly Challenge
  const { data: weeklyChallenge, isLoading: isChallengeLoading } = useQuery({
    queryKey: ["weekly-challenge"],
    queryFn: () => weeklyChallengeService.getCurrentChallenge(),
  });

  // 7. Mutation: Toggle Daily Quest Completion
  const toggleQuestMutation = useMutation({
    mutationFn: ({ runId, completionId }: { runId: string; completionId: string }) =>
      questService.toggleQuest(runId, completionId),
    
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
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["streaks"] });
      queryClient.invalidateQueries({ queryKey: ["decay-status"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-challenge"] }); // Refresh challenge status
    },
  });

  // 8. Mutation: Complete (Lock) the Daily Run
  const completeRunMutation = useMutation({
    mutationFn: (runId: string) => questService.completeRun(runId),
    onSuccess: (data) => {
      toast.success("Daily Run Locked! Leveling up...");
      
      // Check if weekly challenge was unlocked
      if (data.weekly_challenge_unlocked) {
        toast.success(`🔥 WEEKLY BOSS UNLOCKED: ${data.challenge.title}!`, {
          duration: 5000,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["daily-run", "today"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["streaks"] });
      queryClient.invalidateQueries({ queryKey: ["decay-status"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-challenge"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "You cannot lock this run yet.");
    }
  });

  // 9. Mutation: Complete Weekly Challenge
  const completeChallenMutation = useMutation({
    mutationFn: (challengeId: string) => weeklyChallengeService.completeChallenge(challengeId),
    onSuccess: (data) => {
      toast.success(`🏆 BOSS DEFEATED! +${data.xp_earned} XP!`, {
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["weekly-challenge"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to complete challenge");
    }
  });

  // 10. Mutation: Toggle Milestone
  const toggleMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => goalService.toggleMilestone(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // 11. Mutation: Update Goal
  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, title }: { goalId: string; title: string }) =>
      goalService.updateGoal(goalId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // 12. Mutation: Delete Goal
  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: string) => goalService.deleteGoal(goalId),
    onSuccess: () => {
      toast.success("Goal deleted");
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // 13. Mutation: Add Milestone
  const addMilestoneMutation = useMutation({
    mutationFn: ({ goalId, title }: { goalId: string; title: string }) =>
      goalService.addMilestone(goalId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // 14. Mutation: Update Milestone
  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, title }: { milestoneId: string; title: string }) =>
      goalService.updateMilestone(milestoneId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // 15. Mutation: Delete Milestone
  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => goalService.deleteMilestone(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  return {
    // Data
    profile,
    dailyRun,
    activeGoals: goals || [],
    streaks: streaks || [],
    decayStatus: decayStatus || null,
    weeklyChallenge: weeklyChallenge || null,
    
    // States
    isLoading: isProfileLoading || isRunLoading || isGoalsLoading || isStreaksLoading || isChallengeLoading,
    
    // Daily Quest Actions
    toggleQuest: (completionId: string) => {
      if (dailyRun) {
        toggleQuestMutation.mutate({ runId: dailyRun.id, completionId });
      }
    },
    completeRun: () => {
      if (dailyRun) completeRunMutation.mutate(dailyRun.id);
    },

    // Weekly Challenge Actions
    completeWeeklyChallenge: (challengeId: string) => {
      completeChallenMutation.mutate(challengeId);
    },
    isCompletingChallenge: completeChallenMutation.isPending,

    // Goal/Milestone Actions
    toggleMilestone: (milestoneId: string) => toggleMilestoneMutation.mutate(milestoneId),
    updateGoal: (goalId: string, title: string) => updateGoalMutation.mutate({ goalId, title }),
    deleteGoal: (goalId: string) => deleteGoalMutation.mutate(goalId),
    addMilestone: (goalId: string, title: string) => addMilestoneMutation.mutate({ goalId, title }),
    updateMilestone: (milestoneId: string, title: string) => updateMilestoneMutation.mutate({ milestoneId, title }),
    deleteMilestone: (milestoneId: string) => deleteMilestoneMutation.mutate(milestoneId),
  };
};