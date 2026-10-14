import prisma from '../config/prisma';

type StreakType = 'meal' | 'water' | 'weight';

const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
};

const isYesterday = (date: Date, today: Date): boolean => {
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return isSameDay(date, yesterday);
};

const updateTypeStreak = (
  lastDate: Date | null,
  currentStreak: number,
  logDate: Date
): { streak: number; lastDate: Date } | null => {
  if (!lastDate) {
    return { streak: 1, lastDate: logDate };
  }
  if (isSameDay(lastDate, logDate)) {
    return null;
  }
  if (logDate < lastDate) {
    return null;
  }
  if (isYesterday(lastDate, logDate)) {
    return { streak: currentStreak + 1, lastDate: logDate };
  }
  return { streak: 1, lastDate: logDate };
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
    const res = updateTypeStreak(streak.lastMealDate, streak.mealStreak, logDate);
    if (res) {
      updates.mealStreak = res.streak;
      updates.lastMealDate = res.lastDate;
    }
  } else if (type === 'water') {
    const res = updateTypeStreak(streak.lastWaterDate, streak.waterStreak, logDate);
    if (res) {
      updates.waterStreak = res.streak;
      updates.lastWaterDate = res.lastDate;
    }
  } else if (type === 'weight') {
    const res = updateTypeStreak(streak.lastWeightDate, streak.weightStreak, logDate);
    if (res) {
      updates.weightStreak = res.streak;
      updates.lastWeightDate = res.lastDate;
    }
  }

  if (Object.keys(updates).length > 0) {
    await prisma.streak.update({ where: { userId }, data: updates });
  }
};

export const getStreak = async (userId: string) => {
  return prisma.streak.findUnique({ where: { userId } });
};
