import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const searchHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) { sendError(res, 'Query must be at least 2 characters', 400); return; }
    const userId = req.user!.userId;

    const [meals, foods] = await Promise.all([
      prisma.meal.findMany({
        where: { userId, items: { some: { food: { name: { contains: q, mode: 'insensitive' } } } } },
        include: { items: { include: { food: true }, where: { food: { name: { contains: q, mode: 'insensitive' } } } } },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      prisma.food.findMany({
        where: { AND: [{ OR: [{ isCustom: false }, { createdBy: userId }] }, { name: { contains: q, mode: 'insensitive' } }] },
        take: 10,
      }),
    ]);

    sendSuccess(res, { meals, foods, query: q });
  } catch (error) { next(error); }
};

type ActivityMeal = Awaited<ReturnType<typeof prisma.meal.findMany>>[0] & {
  items: Array<{ food: { name: string; calories: number }; quantity: number }>;
};
type ActivityWeight = Awaited<ReturnType<typeof prisma.weightLog.findMany>>[0];
type ActivityWater  = Awaited<ReturnType<typeof prisma.waterLog.findMany>>[0];

export const recentActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const limit = Math.min(parseInt(req.query.limit as string || '15'), 50);

    const [meals, weightLogs, waterLogs] = await Promise.all([
      prisma.meal.findMany({
        where: { userId },
        include: { items: { include: { food: true }, take: 3 } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as Promise<ActivityMeal[]>,
      prisma.weightLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit }) as Promise<ActivityWeight[]>,
      prisma.waterLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit }) as Promise<ActivityWater[]>,
    ]);

    const activity = [
      ...meals.map((m: ActivityMeal) => ({
        type: 'meal' as const, id: m.id, date: m.date, createdAt: m.createdAt,
        data: {
          mealType: m.mealType,
          itemCount: m.items.length,
          preview: m.items.slice(0, 2).map((i: {food:{name:string}}) => i.food.name).join(', '),
          calories: Math.round(m.items.reduce((s: number, i: {food:{calories:number};quantity:number}) => s + i.food.calories * i.quantity, 0)),
        },
      })),
      ...weightLogs.map((w: ActivityWeight) => ({ type: 'weight' as const, id: w.id, date: w.date, createdAt: w.createdAt, data: { weight: w.weight } })),
      ...waterLogs.map((w: ActivityWater) => ({ type: 'water' as const, id: w.id, date: w.date, createdAt: w.createdAt, data: { amount: w.amount } })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);

    sendSuccess(res, activity);
  } catch (error) { next(error); }
};
