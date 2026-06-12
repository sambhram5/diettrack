import prisma from '../config/prisma';
import { updateStreak } from './streak.service';

export interface CreateWeightInput {
  weight: number;
  date: string;
  notes?: string;
}

export const getWeightLogs = async (userId: string, days?: number) => {
  const fromDate = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    : undefined;

  return prisma.weightLog.findMany({
    where: {
      userId,
      ...(fromDate ? { date: { gte: fromDate } } : {}),
    },
    orderBy: { date: 'desc' },
  });
};

export const createWeightLog = async (userId: string, input: CreateWeightInput) => {
  const log = await prisma.weightLog.upsert({
    where: { userId_date: { userId, date: new Date(input.date) } },
    update: { weight: input.weight, notes: input.notes },
    create: {
      userId,
      weight: input.weight,
      date: new Date(input.date),
      notes: input.notes,
    },
  });

  await updateStreak(userId, 'weight', new Date(input.date));

  return log;
};

export const updateWeightLog = async (logId: string, userId: string, input: Partial<CreateWeightInput>) => {
  const log = await prisma.weightLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error('Weight log not found or unauthorized');

  return prisma.weightLog.update({
    where: { id: logId },
    data: { weight: input.weight, notes: input.notes },
  });
};

export const deleteWeightLog = async (logId: string, userId: string) => {
  const log = await prisma.weightLog.findFirst({ where: { id: logId, userId } });
  if (!log) throw new Error('Weight log not found or unauthorized');

  return prisma.weightLog.delete({ where: { id: logId } });
};
