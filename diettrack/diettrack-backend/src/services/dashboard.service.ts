import prisma from '../config/prisma';
import { getDailyNutrition } from './meal.service';
import { getDailyWater } from './water.service';
import { getStreak } from './streak.service';

export const getDashboard = async (userId: string, date: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      calorieTarget: true,
      proteinTarget: true,
      carbsTarget: true,
      fatTarget: true,
      waterGoal: true,
      weight: true,
      goal: true,
    },
  });

  if (!user) throw new Error('User not found');

  const [nutrition, water, streak, latestWeight, recentMeals] = await Promise.all([
    getDailyNutrition(userId, date),
    getDailyWater(userId, date),
    getStreak(userId),
    prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    }),
    prisma.meal.findMany({
      where: { userId },
      include: { items: { include: { food: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const caloriesRemaining = (user.calorieTarget || 0) - nutrition.totals.calories;
  const calorieProgress = user.calorieTarget
    ? Math.min(100, Math.round((nutrition.totals.calories / user.calorieTarget) * 100))
    : 0;
  const waterProgress = user.waterGoal
    ? Math.min(100, Math.round((water.total / user.waterGoal) * 100))
    : 0;

  return {
    user,
    date,
    nutrition: {
      consumed: nutrition.totals,
      remaining: {
        calories: Math.max(0, caloriesRemaining),
        protein: Math.max(0, (user.proteinTarget || 0) - nutrition.totals.protein),
        carbs: Math.max(0, (user.carbsTarget || 0) - nutrition.totals.carbs),
        fat: Math.max(0, (user.fatTarget || 0) - nutrition.totals.fat),
      },
      targets: {
        calories: user.calorieTarget,
        protein: user.proteinTarget,
        carbs: user.carbsTarget,
        fat: user.fatTarget,
      },
      progress: {
        calories: calorieProgress,
        protein: user.proteinTarget
          ? Math.min(100, Math.round((nutrition.totals.protein / user.proteinTarget) * 100))
          : 0,
        carbs: user.carbsTarget
          ? Math.min(100, Math.round((nutrition.totals.carbs / user.carbsTarget) * 100))
          : 0,
        fat: user.fatTarget
          ? Math.min(100, Math.round((nutrition.totals.fat / user.fatTarget) * 100))
          : 0,
      },
    },
    water: {
      consumed: water.total,
      goal: user.waterGoal,
      progress: waterProgress,
      logs: water.logs,
    },
    streak: streak || { mealStreak: 0, waterStreak: 0, weightStreak: 0 },
    currentWeight: latestWeight?.weight || user.weight,
    meals: nutrition.meals,
    recentActivity: recentMeals,
  };
};
