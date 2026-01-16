from datetime import date, timedelta
from app.config import settings
import math


class GameLogic:
    """Core game mechanics and calculations"""
    
    @staticmethod
    def calculate_level(total_xp: int) -> int:
        """
        Calculate level from total XP using square root scaling
        
        Formula: level = floor(sqrt(total_xp / XP_BASE)) + 1
        
        Examples:
        - 0 XP = Level 1
        - 100 XP = Level 2
        - 400 XP = Level 3
        - 900 XP = Level 4
        - 10,000 XP = Level 11
        """
        if total_xp <= 0:
            return 1
        
        level = math.floor(
            math.pow(total_xp / settings.XP_PER_LEVEL_BASE, settings.LEVEL_EXPONENT)
        ) + 1
        
        return max(1, level)
    
    @staticmethod
    def xp_for_level(level: int) -> int:
        """
        Calculate total XP needed to reach a specific level
        
        Formula: xp = (level - 1)^2 * XP_BASE
        """
        if level <= 1:
            return 0
        
        return int(math.pow(level - 1, 2) * settings.XP_PER_LEVEL_BASE)
    
    @staticmethod
    def xp_for_next_level(current_xp: int) -> int:
        """Calculate XP needed for next level"""
        current_level = GameLogic.calculate_level(current_xp)
        next_level_xp = GameLogic.xp_for_level(current_level + 1)
        return next_level_xp - current_xp
    
    @staticmethod
    def level_progress(current_xp: int) -> float:
        """
        Calculate progress to next level as percentage (0-100)
        """
        current_level = GameLogic.calculate_level(current_xp)
        current_level_xp = GameLogic.xp_for_level(current_level)
        next_level_xp = GameLogic.xp_for_level(current_level + 1)
        
        level_xp_range = next_level_xp - current_level_xp
        xp_in_current_level = current_xp - current_level_xp
        
        if level_xp_range == 0:
            return 100.0
        
        return round((xp_in_current_level / level_xp_range) * 100, 2)
    
    @staticmethod
    def is_consecutive_day(last_date: date, current_date: date) -> bool:
        """Check if current_date is exactly one day after last_date"""
        return (current_date - last_date) == timedelta(days=1)
    
    @staticmethod
    def should_reset_streak(last_date: date, current_date: date) -> bool:
        """
        Check if streak should be reset
        
        Streak resets if:
        - Gap is more than 1 day
        - Current date is before last date (shouldn't happen, but safety check)
        """
        if current_date < last_date:
            return True
        
        gap = (current_date - last_date).days
        return gap > 1
    
    @staticmethod
    def calculate_quest_xp(base_xp: int, difficulty_multiplier: float = 1.0) -> int:
        """
        Calculate actual XP for quest completion
        Can apply multipliers for difficulty, perfect days, etc.
        """
        return int(base_xp * difficulty_multiplier)


class StreakCalculator:
    """Streak-specific logic"""
    
    @staticmethod
    def update_streak(
        current_streak: int,
        longest_streak: int,
        last_completed: date,
        completion_date: date
    ) -> tuple[int, int]:
        """
        Update streak counters based on completion date
        
        Returns: (new_current_streak, new_longest_streak)
        """
        if last_completed is None:
            # First completion
            new_current = 1
            new_longest = 1
        elif GameLogic.is_consecutive_day(last_completed, completion_date):
            # Consecutive day - increment streak
            new_current = current_streak + 1
            new_longest = max(longest_streak, new_current)
        elif GameLogic.should_reset_streak(last_completed, completion_date):
            # Gap too large - reset streak
            new_current = 1
            new_longest = longest_streak  # Keep longest
        else:
            # Same day or past day - no change
            new_current = current_streak
            new_longest = longest_streak
        
        return new_current, new_longest


class AntiCheat:
    """Anti-cheat mechanisms"""
    
    @staticmethod
    def can_edit_run(run_date: date, is_locked: bool, current_date: date) -> tuple[bool, str]:
        """
        Check if a daily run can be edited
        
        Returns: (can_edit, reason)
        """
        if is_locked:
            return False, "Run is locked and cannot be edited"
        
        if run_date != current_date:
            return False, "Can only edit today's run"
        
        return True, ""
    
    @staticmethod
    def can_complete_run(run_date: date, current_date: date) -> tuple[bool, str]:
        """
        Check if a daily run can be completed (locked)
        
        Only allow completing today's run
        """
        if run_date != current_date:
            return False, "Can only complete today's run"
        
        return True, ""
    
    @staticmethod
    def validate_backfill(target_date: date, current_date: date, max_backfill_days: int = 1) -> tuple[bool, str]:
        """
        Validate if backfilling a past date is allowed
        
        Allow 1 day backfill (for late night completions)
        """
        gap = (current_date - target_date).days
        
        if gap < 0:
            return False, "Cannot create future runs"
        
        if gap > max_backfill_days:
            return False, f"Can only backfill up to {max_backfill_days} day(s)"
        
        return True, ""