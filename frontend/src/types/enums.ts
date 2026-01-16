export enum QuestCategory {
    ML = "ML",
    CP = "CP",
    Health = "Health",
    Mind = "Mind",
    Finance = "Finance",
  }
  
  export enum QuestDifficulty {
    Easy = "Easy",
    Medium = "Medium",
    Hard = "Hard",
    Legendary = "Legendary",
  }
  
  export type QuestCategoryType = keyof typeof QuestCategory;
  export type QuestDifficultyType = keyof typeof QuestDifficulty;