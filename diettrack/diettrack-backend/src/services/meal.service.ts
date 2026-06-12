import prisma from '../config/prisma';
import type { MealType } from '../types/enums';
import { updateStreak } from './streak.service';

export interface MealItemInput { foodId: string; quantity: number; }

export interface CreateMealInput {
  mealType: MealType; date: string; items: MealItemInput[]; notes?: string;
}

const mealInclude = { items: { include: { food: true } } };

export const getMeals = async (userId: string, date?: string) =>
  prisma.meal.findMany({
    where: { userId, ...(date ? { date: new Date(date) } : {}) },
    include: mealInclude,
    orderBy: { createdAt: 'asc' },
  });

export const createMeal = async (userId: string, input: CreateMealInput) => {
  const meal = await prisma.meal.create({
    data: {
      userId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mealType: input.mealType as any,
      date: new Date(input.date),
      notes: input.notes,
      items: { create: input.items.map(i => ({ foodId: i.foodId, quantity: i.quantity })) },
    },
    include: mealInclude,
  });
  await updateStreak(userId, 'meal', new Date(input.date));
  return meal;
};

export const updateMeal = async (mealId: string, userId: string, input: Partial<CreateMealInput>) => {
  const meal = await prisma.meal.findFirst({ where: { id: mealId, userId } });
  if (!meal) throw new Error('Meal not found or unauthorized');

  return prisma.meal.update({
    where: { id: mealId },
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(input.mealType !== undefined && { mealType: input.mealType as any }),
      ...(input.notes    !== undefined && { notes: input.notes }),
      ...(input.items && {
        items: {
          deleteMany: {},
          create: input.items.map(i => ({ foodId: i.foodId, quantity: i.quantity })),
        },
      }),
    },
    include: mealInclude,
  });
};

export const deleteMeal = async (mealId: string, userId: string) => {
  const meal = await prisma.meal.findFirst({ where: { id: mealId, userId } });
  if (!meal) throw new Error('Meal not found or unauthorized');
  return prisma.meal.delete({ where: { id: mealId } });
};

export const getDailyNutrition = async (userId: string, date: string) => {
  const meals = await prisma.meal.findMany({
    where: { userId, date: new Date(date) },
    include: { items: { include: { food: true } } },
  });

  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const meal of meals) {
    for (const item of meal.items) {
      totals.calories += item.food.calories * item.quantity;
      totals.protein  += item.food.protein  * item.quantity;
      totals.carbs    += item.food.carbs    * item.quantity;
      totals.fat      += item.food.fat      * item.quantity;
      totals.fiber    += item.food.fiber    * item.quantity;
    }
  }

  return {
    meals,
    totals: {
      calories: Math.round(totals.calories), protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs), fat: Math.round(totals.fat), fiber: Math.round(totals.fiber),
    },
  };
};
