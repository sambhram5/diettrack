import type { Gender, ActivityLevel, Goal } from '../types/enums';

interface UserMetrics {
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}

interface NutritionTargets { calories: number; protein: number; carbs: number; fat: number; }

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2, LIGHTLY_ACTIVE: 1.375, MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725, EXTREMELY_ACTIVE: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  WEIGHT_LOSS: -500, WEIGHT_MAINTENANCE: 0, WEIGHT_GAIN: 300, MUSCLE_GAIN: 200,
};

export const calculateBMR = (age: number, gender: Gender, height: number, weight: number): number => {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'MALE') return base + 5;
  if (gender === 'FEMALE') return base - 161;
  return Math.round(base - 78);
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number =>
  bmr * ACTIVITY_MULTIPLIERS[activityLevel];

export const calculateNutritionTargets = (m: UserMetrics): NutritionTargets => {
  const bmr = calculateBMR(m.age, m.gender, m.height, m.weight);
  const tdee = calculateTDEE(bmr, m.activityLevel);
  const calories = Math.max(1200, Math.round(tdee + GOAL_ADJUSTMENTS[m.goal]));
  let p = 0.25, f = 0.30;
  if (m.goal === 'MUSCLE_GAIN')  { p = 0.30; f = 0.25; }
  if (m.goal === 'WEIGHT_LOSS')  { p = 0.35; f = 0.30; }
  return {
    calories,
    protein: Math.round((calories * p) / 4),
    carbs:   Math.round((calories * (1 - p - f)) / 4),
    fat:     Math.round((calories * f) / 9),
  };
};

export const calculateWaterGoal = (weightKg: number): number =>
  Math.min(4000, Math.max(2000, Math.round(weightKg * 35)));
