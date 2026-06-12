import prisma from '../config/prisma';
import { format } from 'date-fns';

const fmtDate = (d: Date) => format(new Date(d), 'yyyy-MM-dd');

const toCSV = (headers: string[], rows: string[][]): string => {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(escape), ...rows.map(r => r.map(escape))].join('\n');
};

export const exportMeals = async (userId: string, from?: string, to?: string) => {
  const meals = await prisma.meal.findMany({
    where: {
      userId,
      ...(from || to ? {
        date: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to   ? { lte: new Date(to)   } : {}),
        },
      } : {}),
    },
    include: { items: { include: { food: true } } },
    orderBy: { date: 'desc' },
  });

  const headers = ['Date','Meal Type','Food','Serving Size (g)','Quantity','Calories','Protein (g)','Carbs (g)','Fat (g)','Fiber (g)'];
  const rows: string[][] = [];

  for (const meal of meals) {
    for (const item of meal.items) {
      rows.push([
        fmtDate(meal.date),
        meal.mealType,
        item.food.name,
        String(item.food.servingSize),
        String(item.quantity),
        String(Math.round(item.food.calories * item.quantity)),
        String(Math.round(item.food.protein * item.quantity * 10) / 10),
        String(Math.round(item.food.carbs   * item.quantity * 10) / 10),
        String(Math.round(item.food.fat     * item.quantity * 10) / 10),
        String(Math.round(item.food.fiber   * item.quantity * 10) / 10),
      ]);
    }
  }
  return toCSV(headers, rows);
};

export const exportWeights = async (userId: string) => {
  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  const headers = ['Date','Weight (kg)','Notes'];
  const rows = (logs as Array<{date: Date; weight: number; notes: string | null}>).map(l => [fmtDate(l.date), String(l.weight), l.notes ?? '']);
  return toCSV(headers, rows);
};

export const exportWater = async (userId: string) => {
  const logs = await prisma.waterLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  const headers = ['Date','Amount (ml)','Logged At'];
  const rows = (logs as Array<{date: Date; amount: number; createdAt: Date}>).map(l => [fmtDate(l.date), String(l.amount), format(new Date(l.createdAt), 'yyyy-MM-dd HH:mm')]);
  return toCSV(headers, rows);
};

export const exportAll = async (userId: string) => {
  const [meals, weights, water] = await Promise.all([
    exportMeals(userId),
    exportWeights(userId),
    exportWater(userId),
  ]);
  return { meals, weights, water };
};

// Weekly summary
export const weeklyReport = async (userId: string) => {
  const end   = new Date();
  const start = new Date(); start.setDate(start.getDate() - 6); start.setHours(0,0,0,0);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const [meals, waterLogs, weightLogs, streak] = await Promise.all([
    prisma.meal.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { items: { include: { food: true } } },
    }),
    prisma.waterLog.findMany({ where: { userId, date: { gte: start, lte: end } } }),
    prisma.weightLog.findMany({ where: { userId, date: { gte: start, lte: end } }, orderBy: { date: 'asc' } }),
    prisma.streak.findUnique({ where: { userId } }),
  ]);

  // Aggregate by day
  const byDay: Record<string, { calories: number; protein: number; carbs: number; fat: number; water: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    byDay[fmtDate(d)] = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 };
  }

  for (const meal of meals) {
    const k = fmtDate(meal.date);
    if (!byDay[k]) continue;
    for (const item of meal.items) {
      byDay[k].calories += item.food.calories * item.quantity;
      byDay[k].protein  += item.food.protein  * item.quantity;
      byDay[k].carbs    += item.food.carbs    * item.quantity;
      byDay[k].fat      += item.food.fat      * item.quantity;
    }
  }
  for (const log of waterLogs) {
    const k = fmtDate(log.date);
    if (byDay[k]) byDay[k].water += log.amount;
  }

  const days = Object.values(byDay);
  const daysLogged = days.filter(d => d.calories > 0).length;
  const avgCalories = daysLogged > 0 ? Math.round(days.reduce((s, d) => s + d.calories, 0) / daysLogged) : 0;
  const avgProtein  = daysLogged > 0 ? Math.round(days.reduce((s, d) => s + d.protein,  0) / daysLogged) : 0;
  const avgWater    = daysLogged > 0 ? Math.round(days.reduce((s, d) => s + d.water,    0) / daysLogged) : 0;
  const goalDays    = days.filter(d => user.calorieTarget && d.calories >= user.calorieTarget * 0.9 && d.calories <= user.calorieTarget * 1.1).length;
  const weightChange = weightLogs.length >= 2
    ? Math.round((weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight) * 10) / 10
    : null;

  return {
    week: { start: fmtDate(start), end: fmtDate(end) },
    summary: { daysLogged, avgCalories, avgProtein, avgWater, goalDays, weightChange },
    targets: { calories: user.calorieTarget, protein: user.proteinTarget, water: user.waterGoal },
    streak: streak ?? { mealStreak: 0, waterStreak: 0, weightStreak: 0 },
    dailyBreakdown: Object.entries(byDay).map(([date, data]) => ({ date, ...data })),
  };
};
