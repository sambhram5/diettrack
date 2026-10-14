import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import config from '../config';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { calculateNutritionTargets, calculateWaterGoal } from '../utils/nutrition';
import type { Gender, ActivityLevel, Goal } from '../types/enums';

export interface RegisterInput {
  name: string; email: string; password: string; age: number;
  gender: Gender; height: number; weight: number;
  activityLevel: ActivityLevel; goal: Goal;
}

export interface LoginInput { email: string; password: string; }

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error('Email already registered');

  const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);
  const targets = calculateNutritionTargets({
    age: input.age, gender: input.gender, height: input.height,
    weight: input.weight, activityLevel: input.activityLevel, goal: input.goal,
  });
  const waterGoal = calculateWaterGoal(input.weight);

  const user = await prisma.user.create({
    data: {
      name: input.name, email: input.email, passwordHash,
      age: input.age,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gender: input.gender as any,
      height: input.height, weight: input.weight,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      activityLevel: input.activityLevel as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      goal: input.goal as any,
      waterGoal,
      calorieTarget: targets.calories, proteinTarget: targets.protein,
      carbsTarget: targets.carbs, fatTarget: targets.fat,
      streak: { create: { mealStreak: 0, waterStreak: 0, weightStreak: 0 } },
    },
    select: {
      id: true, name: true, email: true, age: true, gender: true,
      height: true, weight: true, activityLevel: true, goal: true,
      waterGoal: true, calorieTarget: true, proteinTarget: true,
      carbsTarget: true, fatTarget: true, createdAt: true,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true, name: true, email: true, passwordHash: true, age: true, gender: true,
      height: true, weight: true, activityLevel: true, goal: true,
      waterGoal: true, calorieTarget: true, proteinTarget: true,
      carbsTarget: true, fatTarget: true, createdAt: true,
    },
  });

  if (!user) throw new Error('Invalid email or password');
  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) throw new Error('Invalid email or password');

  const { passwordHash: _, ...userWithoutPassword } = user;
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
  });

  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) throw new Error('Invalid or expired refresh token');
  if (stored.userId !== payload.userId) throw new Error('Token mismatch');

  const newAccess = generateAccessToken({ userId: payload.userId, email: payload.email });
  const newRefresh = generateRefreshToken({ userId: payload.userId, email: payload.email });
  await prisma.refreshToken.delete({ where: { token } });
  await prisma.refreshToken.create({
    data: { token: newRefresh, userId: payload.userId, expiresAt: getRefreshTokenExpiry() },
  });
  return { accessToken: newAccess, refreshToken: newRefresh };
};

export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};
