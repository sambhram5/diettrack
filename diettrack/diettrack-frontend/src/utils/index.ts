import { format, parseISO } from 'date-fns';
import { MealType, Goal, ActivityLevel, Gender } from '../types';

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
};

export const formatShortDate = (date: string | Date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
};

export const today = () => format(new Date(), 'yyyy-MM-dd');

export const calcMealNutrition = (items: Array<{ food: { calories: number; protein: number; carbs: number; fat: number }; quantity: number }>) => {
  return items.reduce((acc, item) => ({
    calories: acc.calories + item.food.calories * item.quantity,
    protein: acc.protein + item.food.protein * item.quantity,
    carbs: acc.carbs + item.food.carbs * item.quantity,
    fat: acc.fat + item.food.fat * item.quantity,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

export const round1 = (n: number) => Math.round(n * 10) / 10;

export const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

export const MEAL_EMOJIS: Record<MealType, string> = {
  BREAKFAST: '🌅',
  LUNCH: '☀️',
  DINNER: '🌙',
  SNACK: '🍎',
};

export const GOAL_LABELS: Record<Goal, string> = {
  WEIGHT_LOSS: 'Weight Loss',
  WEIGHT_MAINTENANCE: 'Maintenance',
  WEIGHT_GAIN: 'Weight Gain',
  MUSCLE_GAIN: 'Muscle Gain',
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: 'Sedentary',
  LIGHTLY_ACTIVE: 'Lightly Active',
  MODERATELY_ACTIVE: 'Moderately Active',
  VERY_ACTIVE: 'Very Active',
  EXTREMELY_ACTIVE: 'Extremely Active',
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

export const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axErr = error as { response?: { data?: { message?: string } } };
    return axErr.response?.data?.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An error occurred';
};
