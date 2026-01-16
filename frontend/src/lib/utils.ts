import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Brain, Code2, Heart, Sparkles, TrendingUp } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the icon component for a quest category
 */
export function getCategoryIcon(category: string) {
  const icons: Record<string, any> = {
    ML: Brain,
    CP: Code2,
    Health: Heart,
    Mind: Sparkles,
    Finance: TrendingUp,
  };
  
  return icons[category] || Code2;
}

/**
 * Get the color class for a quest category
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    ML: "text-purple-400 bg-purple-500/10",
    CP: "text-blue-400 bg-blue-500/10",
    Health: "text-red-400 bg-red-500/10",
    Mind: "text-yellow-400 bg-yellow-500/10",
    Finance: "text-green-400 bg-green-500/10",
  };
  
  return colors[category] || "text-gray-400 bg-gray-500/10";
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    Easy: "text-green-400",
    Medium: "text-yellow-400",
    Hard: "text-orange-400",
    Legendary: "text-purple-400",
  };
  
  return colors[difficulty] || "text-gray-400";
}

/**
 * Format XP with K suffix
 */
export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

/**
 * Format date to readable string
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}