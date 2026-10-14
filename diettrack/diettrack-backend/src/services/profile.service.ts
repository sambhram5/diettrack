import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import config from '../config';
import { calculateNutritionTargets, calculateWaterGoal } from '../utils/nutrition';
import type { Gender, ActivityLevel, Goal } from '../types/enums';

export interface UpdateProfileInput {
  name?: string; age?: number; gender?: Gender; height?: number; weight?: number;
  activityLevel?: ActivityLevel; goal?: Goal; waterGoal?: number;
  currentPassword?: string; newPassword?: string;
}

export const getProfile = async (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, age: true, gender: true,
      height: true, weight: true, activityLevel: true, goal: true,
      waterGoal: true, calorieTarget: true, proteinTarget: true,
      carbsTarget: true, fatTarget: true, createdAt: true,
    },
  });

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  if (input.newPassword) {
    if (!input.currentPassword) throw new Error('Current password required');
    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) throw new Error('Current password is incorrect');
  }

  const newPasswordHash = input.newPassword
    ? await bcrypt.hash(input.newPassword, config.bcryptRounds)
    : undefined;

  const needsRecalc =
    input.age !== undefined || input.gender !== undefined || input.height !== undefined ||
    input.weight !== undefined || input.activityLevel !== undefined || input.goal !== undefined;

  let recalcTargets: { calorieTarget: number; proteinTarget: number; carbsTarget: number; fatTarget: number } | undefined;
  if (needsRecalc) {
    const t = calculateNutritionTargets({
      age:           input.age           ?? user.age,
      gender:        (input.gender        ?? user.gender)        as Gender,
      height:        input.height        ?? user.height,
      weight:        input.weight        ?? user.weight,
      activityLevel: (input.activityLevel ?? user.activityLevel) as ActivityLevel,
      goal:          (input.goal          ?? user.goal)          as Goal,
    });
    recalcTargets = { calorieTarget: t.calories, proteinTarget: t.protein, carbsTarget: t.carbs, fatTarget: t.fat };
  }

  const rawWaterGoal = typeof input.waterGoal === 'number' && !isNaN(input.waterGoal) && input.waterGoal > 0
    ? input.waterGoal
    : undefined;

  const waterGoal = rawWaterGoal ?? (input.weight ? calculateWaterGoal(input.weight) : undefined);

  // Build update object — only Prisma enum fields need `as any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};
  if (input.name             !== undefined) data.name           = input.name;
  if (input.age              !== undefined) data.age            = input.age;
  if (input.gender           !== undefined) data.gender         = input.gender;   // string → Prisma accepts via any
  if (input.height           !== undefined) data.height         = input.height;
  if (input.weight           !== undefined) data.weight         = input.weight;
  if (input.activityLevel    !== undefined) data.activityLevel  = input.activityLevel;
  if (input.goal             !== undefined) data.goal           = input.goal;
  if (waterGoal              !== undefined) data.waterGoal      = waterGoal;
  if (newPasswordHash)                      data.passwordHash   = newPasswordHash;
  if (recalcTargets) Object.assign(data, recalcTargets);

  return prisma.user.update({
    where: { id: userId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: data as any,
    select: {
      id: true, name: true, email: true, age: true, gender: true,
      height: true, weight: true, activityLevel: true, goal: true,
      waterGoal: true, calorieTarget: true, proteinTarget: true, carbsTarget: true, fatTarget: true,
    },
  });
};
