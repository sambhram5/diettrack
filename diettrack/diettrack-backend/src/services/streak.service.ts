import prisma from '../config/prisma';

type StreakType = 'meal' | 'water' | 'weight';

const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const isYesterday = (date: Date, today: Date): boolean => {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

export const updateStreak = async (userId: string, type: StreakType, logDate: Date) => {
  let streak = await prisma.streak.findUnique({ where: { userId } });

  if (!streak) {
    streak = await prisma.streak.create({
      data: { userId, mealStreak: 0, waterStreak: 0, weightStreak: 0 },
    });
  }

  const updates: Record<string, unknown> = {};

  if (type === 'meal') {
    const lastDate = streak.lastMealDate;
    if (!lastDate || isYesterday(lastDate, logDate)) {
      updates.mealStreak = streak.mealStreak + 1;
      updates.lastMealDate = logDate;
    } else if (!isSameDay(lastDate, logDate)) {
      updates.mealStreak = 1;
      updates.lastMealDate = logDate;
    }
  } else if (type === 'water') {
    const lastDate = streak.lastWaterDate;
    if (!lastDate || isYesterday(lastDate, logDate)) {
      updates.waterStreak = streak.waterStreak + 1;
      updates.lastWaterDate = logDate;
    } else if (!isSameDay(lastDate, logDate)) {
      updates.waterStreak = 1;
      updates.lastWaterDate = logDate;
    }
  } else if (type === 'weight') {
    const lastDate = streak.lastWeightDate;
    if (!lastDate || isYesterday(lastDate, logDate)) {
      updates.weightStreak = streak.weightStreak + 1;
      updates.lastWeightDate = logDate;
    } else if (!isSameDay(lastDate, logDate)) {
      updates.weightStreak = 1;
      updates.lastWeightDate = logDate;
    }
  }

  if (Object.keys(updates).length > 0) {
    await prisma.streak.update({ where: { userId }, data: updates });
  }
};

export const getStreak = async (userId: string) => {
  return prisma.streak.findUnique({ where: { userId } });
};
