from typing import Dict
from app.game_logic import GameLogic


class XPService:
    """Business logic for XP and leveling"""
    
    @staticmethod
    def calculate_level_info(total_xp: int) -> Dict:
        """
        Calculate comprehensive level information
        
        Returns all level-related data needed for UI
        """
        current_level = GameLogic.calculate_level(total_xp)
        xp_for_current = GameLogic.xp_for_level(current_level)
        xp_for_next = GameLogic.xp_for_level(current_level + 1)
        xp_in_level = total_xp - xp_for_current
        xp_needed_for_next = xp_for_next - total_xp
        level_progress = GameLogic.level_progress(total_xp)
        
        return {
            "current_level": current_level,
            "total_xp": total_xp,
            "xp_for_current_level": xp_for_current,
            "xp_for_next_level": xp_for_next,
            "xp_in_current_level": xp_in_level,
            "xp_needed_for_next_level": xp_needed_for_next,
            "level_progress_percentage": level_progress,
            "level_range": xp_for_next - xp_for_current
        }
    
    @staticmethod
    def calculate_quest_xp(
        base_xp: int,
        difficulty: str,
        is_perfect_day: bool = False
    ) -> int:
        """
        Calculate actual XP earned for quest
        
        Can add multipliers for:
        - Difficulty bonuses
        - Perfect day bonuses
        - Streak bonuses (future)
        """
        multiplier = 1.0
        
        # Difficulty multiplier (future enhancement)
        # if difficulty == "Hard":
        #     multiplier *= 1.2
        # elif difficulty == "Easy":
        #     multiplier *= 0.8
        
        # Perfect day bonus (future enhancement)
        # if is_perfect_day:
        #     multiplier *= 1.1
        
        return GameLogic.calculate_quest_xp(base_xp, multiplier)
    
    @staticmethod
    def xp_breakdown(daily_runs: list) -> Dict:
        """
        Breakdown XP sources from daily runs
        
        Useful for analytics
        """
        total_xp = sum(run.get("total_xp", 0) for run in daily_runs)
        perfect_days = sum(1 for run in daily_runs if run.get("is_perfect", False))
        total_days = len(daily_runs)
        
        avg_xp_per_day = total_xp / total_days if total_days > 0 else 0
        
        return {
            "total_xp": total_xp,
            "total_days": total_days,
            "perfect_days": perfect_days,
            "average_xp_per_day": round(avg_xp_per_day, 2),
            "perfect_day_percentage": round((perfect_days / total_days * 100), 2) if total_days > 0 else 0
        }
    
    @staticmethod
    def calculate_level_milestones() -> Dict:
        """
        Generate level milestones for UI display
        
        Shows XP needed for important levels
        """
        milestones = {}
        important_levels = [5, 10, 15, 20, 25, 30, 50, 75, 100]
        
        for level in important_levels:
            milestones[f"level_{level}"] = GameLogic.xp_for_level(level)
        
        return milestones