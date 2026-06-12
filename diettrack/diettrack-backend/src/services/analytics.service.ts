import prisma from '../config/prisma';

const getDateRange = (days: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const getAnalytics = async (userId: string, period: '7d' | '30d' | '90d' = '30d') => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const { start, end } = getDateRange(days);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      calorieTarget: true,
      proteinTarget: true,
      carbsTarget: true,
      fatTarget: true,
      waterGoal: true,
    },
  });

  const [meals, waterLogs, weightLogs] = await Promise.all([
    prisma.meal.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { items: { include: { food: true } } },
      orderBy: { date: 'asc' },
    }),
    prisma.waterLog.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    }),
    prisma.weightLog.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    }),
  ]);

  // Aggregate nutrition by date
  const nutritionByDate: Record<string, { calories: number; protein: number; carbs: number; fat: number; date: string }> = {};

  for (const meal of meals) {
    const dateKey = formatDate(meal.date);
    if (!nutritionByDate[dateKey]) {
      nutritionByDate[dateKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, date: dateKey };
    }
    for (const item of meal.items) {
      nutritionByDate[dateKey].calories += item.food.calories * item.quantity;
      nutritionByDate[dateKey].protein += item.food.protein * item.quantity;
      nutritionByDate[dateKey].carbs += item.food.carbs * item.quantity;
      nutritionByDate[dateKey].fat += item.food.fat * item.quantity;
    }
  }

  // Round values
  const nutritionTrend = Object.values(nutritionByDate).map((d) => ({
    date: d.date,
    calories: Math.round(d.calories),
    protein: Math.round(d.protein),
    carbs: Math.round(d.carbs),
    fat: Math.round(d.fat),
  }));

  // Aggregate water by date
  const waterByDate: Record<string, number> = {};
  for (const log of waterLogs as Array<{date: Date; amount: number; createdAt?: Date}>) {
    const dateKey = formatDate(log.date);
    waterByDate[dateKey] = (waterByDate[dateKey] || 0) + log.amount;
  }
  const waterTrend = Object.entries(waterByDate).map(([date, amount]) => ({ date, amount }));

  // Weight trend
  const weightTrend = (weightLogs as Array<{date: Date; weight: number}>).map((log) => ({
    date: formatDate(log.date),
    weight: log.weight,
  }));

  // Calculate averages
  const avgCalories =
    nutritionTrend.length > 0
      ? Math.round(nutritionTrend.reduce((sum, d) => sum + d.calories, 0) / nutritionTrend.length)
      : 0;

  const goalAchievementDays = nutritionTrend.filter(
    (d) => user?.calorieTarget && d.calories >= user.calorieTarget * 0.9 && d.calories <= user.calorieTarget * 1.1
  ).length;
  const goalAchievementRate =
    nutritionTrend.length > 0 ? Math.round((goalAchievementDays / nutritionTrend.length) * 100) : 0;

  // Weight change
  const weightChange =
    weightTrend.length >= 2
      ? +(weightTrend[weightTrend.length - 1].weight - weightTrend[0].weight).toFixed(1)
      : 0;

  // Generate insights
  const insights: string[] = [];
  if (avgCalories > 0 && user?.calorieTarget) {
    const pct = Math.round((avgCalories / user.calorieTarget) * 100);
    insights.push(`You averaged ${pct}% of your calorie goal over the last ${days} days.`);
  }
  if (weightChange < 0) {
    insights.push(`You lost ${Math.abs(weightChange)}kg over this period.`);
  } else if (weightChange > 0) {
    insights.push(`You gained ${weightChange}kg over this period.`);
  }
  if (goalAchievementRate >= 80) {
    insights.push(`Outstanding! You hit your calorie target on ${goalAchievementRate}% of days.`);
  }

  return {
    period,
    nutritionTrend,
    waterTrend,
    weightTrend,
    summary: {
      avgCalories,
      goalAchievementRate,
      weightChange,
      daysTracked: nutritionTrend.length,
      targets: user,
    },
    insights,
  };
};
