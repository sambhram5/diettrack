import prisma from '../config/prisma';

export interface CreateFoodInput {
  name: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export const getFoods = async (userId: string, search?: string) => {
  return prisma.food.findMany({
    where: {
      AND: [
        { OR: [{ isCustom: false }, { createdBy: userId }] },
        search ? { name: { contains: search, mode: 'insensitive' } } : {},
      ],
    },
    orderBy: [{ isCustom: 'asc' }, { name: 'asc' }],
  });
};

export const createFood = async (userId: string, input: CreateFoodInput) => {
  return prisma.food.create({
    data: {
      ...input,
      isCustom: true,
      createdBy: userId,
    },
  });
};

export const updateFood = async (foodId: string, userId: string, input: Partial<CreateFoodInput>) => {
  const food = await prisma.food.findFirst({
    where: { id: foodId, createdBy: userId, isCustom: true },
  });

  if (!food) throw new Error('Food not found or unauthorized');

  return prisma.food.update({
    where: { id: foodId },
    data: input,
  });
};

export const deleteFood = async (foodId: string, userId: string) => {
  const food = await prisma.food.findFirst({
    where: { id: foodId, createdBy: userId, isCustom: true },
  });

  if (!food) throw new Error('Food not found or unauthorized');

  const usedInMeals = await prisma.mealItem.count({ where: { foodId } });
  if (usedInMeals > 0) {
    throw new Error('Cannot delete this food because it is used in logged meals');
  }

  return prisma.food.delete({ where: { id: foodId } });
};
