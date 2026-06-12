import prisma from '../config/prisma';
import { updateStreak } from './streak.service';

export interface CreateWaterInput {
  amount: number;
  date: string;
}

export const getWaterLogs = async (userId: string, date?: string) => {
  return prisma.waterLog.findMany({
    where: {
      userId,
      ...(date ? { date: new Date(date) } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getDailyWater = async (userId: string, date: string) => {
  const logs = await prisma.waterLog.findMany({
    where: { userId, date: new Date(date) },
  });
  const total = (logs as Array<{amount: number}>).reduce((sum: number, log: {amount: number}) => sum + log.amount, 0);
  return { logs, total };
};

export const createWaterLog = async (userId: string, input: CreateWaterInput) => {
  const log = await prisma.waterLog.create({
    data: {
      userId,
      amount: input.amount,
      date: new Date(input.date),
    },
  });

  // Check if daily goal met for streak
  const { total } = await getDailyWater(userId, input.date);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { waterGoal: true } });
  if (user && total >= user.waterGoal) {
    await updateStreak(userId, 'water', new Date(input.date));
  }

  return log;
};

export const updateWaterLog = async (logId: string, userId: string, amount: number) => {
  const log = await prisma.waterLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error('Water log not found or unauthorized');

  return prisma.waterLog.update({
    where: { id: logId },
    data: { amount },
  });
};

export const deleteWaterLog = async (logId: string, userId: string) => {
  const log = await prisma.waterLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error('Water log not found or unauthorized');

  return prisma.waterLog.delete({ where: { id: logId } });
};
