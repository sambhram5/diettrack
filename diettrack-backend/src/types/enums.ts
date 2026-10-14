// Mirror of prisma/schema.prisma enums.
// Exact string values — Prisma accepts these via `as any` cast at query sites.
export type Gender         = 'MALE' | 'FEMALE' | 'OTHER';
export type ActivityLevel  = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';
export type Goal           = 'WEIGHT_LOSS' | 'WEIGHT_MAINTENANCE' | 'WEIGHT_GAIN' | 'MUSCLE_GAIN';
export type MealType       = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
