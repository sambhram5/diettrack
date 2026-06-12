import api from './api';
import { Meal, MealType } from '../types';

export interface DailyMealData {
  meals: Meal[];
  totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number } | null;
}

export const mealService = {
  async getMeals(date?: string): Promise<DailyMealData> {
    const params = date ? { date } : {};
    const res = await api.get('/meals', { params });
    return res.data.data;
  },

  async createMeal(data: {
    mealType: MealType; date: string;
    items: Array<{ foodId: string; quantity: number }>; notes?: string;
  }): Promise<Meal> {
    const res = await api.post('/meals', data);
    return res.data.data;
  },

  async updateMeal(id: string, data: Partial<{ mealType: MealType; items: Array<{ foodId: string; quantity: number }>; notes: string }>): Promise<Meal> {
    const res = await api.put(`/meals/${id}`, data);
    return res.data.data;
  },

  async deleteMeal(id: string): Promise<void> {
    await api.delete(`/meals/${id}`);
  },
};
