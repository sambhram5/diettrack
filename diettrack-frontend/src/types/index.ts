export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
export type Goal = 'WEIGHT_LOSS' | 'WEIGHT_MAINTENANCE' | 'WEIGHT_GAIN' | 'MUSCLE_GAIN';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  waterGoal: number;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbsTarget: number | null;
  fatTarget: number | null;
  createdAt: string;
}

export interface Food {
  id: string;
  name: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  isCustom: boolean;
  createdBy?: string;
}

export interface MealItem {
  id: string;
  foodId: string;
  food: Food;
  quantity: number;
}

export interface Meal {
  id: string;
  mealType: MealType;
  date: string;
  notes?: string;
  items: MealItem[];
  createdAt: string;
}

export interface WeightLog {
  id: string;
  weight: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface WaterLog {
  id: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Streak {
  mealStreak: number;
  waterStreak: number;
  weightStreak: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DashboardData {
  user: {
    name: string;
    calorieTarget: number | null;
    proteinTarget: number | null;
    carbsTarget: number | null;
    fatTarget: number | null;
    waterGoal: number;
    weight: number;
    goal: Goal;
  };
  date: string;
  nutrition: {
    consumed: NutritionTotals;
    remaining: { calories: number; protein: number; carbs: number; fat: number };
    targets: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null };
    progress: { calories: number; protein: number; carbs: number; fat: number };
  };
  water: {
    consumed: number;
    goal: number;
    progress: number;
    logs: WaterLog[];
  };
  streak: Streak;
  currentWeight: number;
  meals: Meal[];
}

export interface AnalyticsData {
  period: string;
  nutritionTrend: Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }>;
  waterTrend: Array<{ date: string; amount: number }>;
  weightTrend: Array<{ date: string; weight: number }>;
  summary: {
    avgCalories: number;
    goalAchievementRate: number;
    weightChange: number;
    daysTracked: number;
    targets: {
      calorieTarget: number | null;
      proteinTarget: number | null;
      carbsTarget: number | null;
      fatTarget: number | null;
      waterGoal: number;
    } | null;
  };
  insights: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
