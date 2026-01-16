/**
 * XP Service - Handles level progression and XP calculations
 */

/**
 * Calculate level from total XP using the formula: level = floor(sqrt(xp / 100)) + 1
 */
export const calculateLevel = (totalXp: number): number => {
    if (totalXp < 0) return 1;
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
  };
  
  /**
   * Calculate XP required for a specific level
   */
  export const xpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    return Math.pow(level - 1, 2) * 100;
  };
  
  /**
   * Calculate XP needed to reach the next level
   */
  export const xpToNextLevel = (currentXp: number): number => {
    const currentLevel = calculateLevel(currentXp);
    const nextLevelXp = xpForLevel(currentLevel + 1);
    return nextLevelXp - currentXp;
  };
  
  /**
   * Calculate progress percentage to next level
   */
  export const levelProgress = (currentXp: number): number => {
    const currentLevel = calculateLevel(currentXp);
    const currentLevelXp = xpForLevel(currentLevel);
    const nextLevelXp = xpForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXp - currentLevelXp;
    const xpNeededForLevel = nextLevelXp - currentLevelXp;
    
    return Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100);
  };
  
  /**
   * Get XP multiplier based on difficulty
   */
  export const getXpMultiplier = (difficulty: string): number => {
    const multipliers: Record<string, number> = {
      Easy: 1,
      Medium: 1.5,
      Hard: 2,
      Legendary: 3,
    };
    return multipliers[difficulty] || 1;
  };
  
  export const xpService = {
    calculateLevel,
    xpForLevel,
    xpToNextLevel,
    levelProgress,
    getXpMultiplier,
  };