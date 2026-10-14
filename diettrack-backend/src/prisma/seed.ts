import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foods = [
  // Proteins
  { name: 'Chicken Breast (cooked)', servingSize: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
  { name: 'Salmon (cooked)', servingSize: 100, calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0 },
  { name: 'Egg (large)', servingSize: 50, calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sugar: 0.6 },
  { name: 'Greek Yogurt (plain)', servingSize: 100, calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2 },
  { name: 'Cottage Cheese', servingSize: 100, calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7 },
  { name: 'Tuna (canned)', servingSize: 100, calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0, sugar: 0 },
  { name: 'Ground Beef (lean)', servingSize: 100, calories: 215, protein: 26, carbs: 0, fat: 12, fiber: 0, sugar: 0 },
  { name: 'Turkey Breast', servingSize: 100, calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, sugar: 0 },
  { name: 'Shrimp (cooked)', servingSize: 100, calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, sugar: 0 },
  { name: 'Tofu (firm)', servingSize: 100, calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.5 },
  { name: 'Whey Protein Powder', servingSize: 30, calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0, sugar: 2 },
  { name: 'Edamame', servingSize: 100, calories: 121, protein: 11, carbs: 9, fat: 5, fiber: 5, sugar: 2 },
  // Grains
  { name: 'Brown Rice (cooked)', servingSize: 100, calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4 },
  { name: 'White Rice (cooked)', servingSize: 100, calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0 },
  { name: 'Oatmeal (cooked)', servingSize: 100, calories: 71, protein: 2.5, carbs: 12, fat: 1.5, fiber: 1.7, sugar: 0.5 },
  { name: 'Whole Wheat Bread', servingSize: 30, calories: 69, protein: 3.6, carbs: 12, fat: 0.9, fiber: 1.9, sugar: 1.4 },
  { name: 'Quinoa (cooked)', servingSize: 100, calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, sugar: 0.9 },
  { name: 'Sweet Potato (baked)', servingSize: 100, calories: 90, protein: 2, carbs: 21, fat: 0.1, fiber: 3.3, sugar: 4.2 },
  { name: 'Pasta (cooked)', servingSize: 100, calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6 },
  { name: 'Whole Wheat Pasta', servingSize: 100, calories: 124, protein: 5.3, carbs: 23, fat: 1.1, fiber: 3.9, sugar: 0.8 },
  // Vegetables
  { name: 'Broccoli', servingSize: 100, calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7 },
  { name: 'Spinach', servingSize: 100, calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
  { name: 'Kale', servingSize: 100, calories: 49, protein: 4.3, carbs: 9, fat: 0.9, fiber: 3.6, sugar: 2.3 },
  { name: 'Carrots', servingSize: 100, calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  { name: 'Bell Pepper (red)', servingSize: 100, calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2 },
  { name: 'Cucumber', servingSize: 100, calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7 },
  { name: 'Tomato', servingSize: 100, calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  { name: 'Avocado', servingSize: 100, calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7 },
  { name: 'Zucchini', servingSize: 100, calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5 },
  { name: 'Cauliflower', servingSize: 100, calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sugar: 1.9 },
  // Fruits
  { name: 'Banana', servingSize: 118, calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14 },
  { name: 'Apple', servingSize: 182, calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19 },
  { name: 'Blueberries', servingSize: 100, calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4, sugar: 10 },
  { name: 'Strawberries', servingSize: 100, calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },
  { name: 'Orange', servingSize: 131, calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1, sugar: 12 },
  { name: 'Mango', servingSize: 100, calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7 },
  // Dairy
  { name: 'Milk (whole)', servingSize: 244, calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12 },
  { name: 'Milk (skim)', servingSize: 244, calories: 83, protein: 8.3, carbs: 12, fat: 0.2, fiber: 0, sugar: 12 },
  { name: 'Cheddar Cheese', servingSize: 28, calories: 113, protein: 7, carbs: 0.4, fat: 9.3, fiber: 0, sugar: 0.1 },
  { name: 'Mozzarella', servingSize: 28, calories: 85, protein: 6.3, carbs: 0.6, fat: 6.3, fiber: 0, sugar: 0.2 },
  // Fats & Nuts
  { name: 'Almonds', servingSize: 28, calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1.2 },
  { name: 'Walnuts', servingSize: 28, calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, sugar: 0.7 },
  { name: 'Peanut Butter', servingSize: 32, calories: 191, protein: 7, carbs: 7, fat: 16, fiber: 1.6, sugar: 3 },
  { name: 'Olive Oil', servingSize: 14, calories: 119, protein: 0, carbs: 0, fat: 13.5, fiber: 0, sugar: 0 },
  { name: 'Cashews', servingSize: 28, calories: 157, protein: 5.2, carbs: 8.6, fat: 12.4, fiber: 0.9, sugar: 1.7 },
  { name: 'Chia Seeds', servingSize: 28, calories: 138, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8, sugar: 0 },
  // Legumes
  { name: 'Black Beans (cooked)', servingSize: 100, calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7, sugar: 0.3 },
  { name: 'Chickpeas (cooked)', servingSize: 100, calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6, sugar: 4.8 },
  { name: 'Lentils (cooked)', servingSize: 100, calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, sugar: 1.8 },
  { name: 'Kidney Beans (cooked)', servingSize: 100, calories: 127, protein: 8.7, carbs: 22, fat: 0.5, fiber: 7.4, sugar: 0.3 },
  // Common
  { name: 'Pizza (cheese slice)', servingSize: 107, calories: 272, protein: 12, carbs: 34, fat: 9.8, fiber: 2.3, sugar: 3.6 },
  { name: 'French Fries', servingSize: 100, calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, sugar: 0.3 },
  { name: 'Coffee (black)', servingSize: 240, calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
  { name: 'Orange Juice', servingSize: 240, calories: 112, protein: 1.7, carbs: 26, fat: 0.5, fiber: 0.5, sugar: 21 },
];

async function main() {
  console.log('🌱 Seeding database...');
  let seeded = 0;
  for (const food of foods) {
    const existing = await prisma.food.findFirst({ where: { name: food.name, isCustom: false } });
    if (!existing) {
      await prisma.food.create({ data: { ...food, isCustom: false } });
      seeded++;
    }
  }
  console.log(`✅ Seeded ${seeded} new foods (${foods.length - seeded} already existed)`);
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
