import { and, desc, eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";

import * as schema from "./schema";
import {
  diary, foods, mealLogs,
  NewDiaryEntry,
  NewFood,
  NewMealLog,
  NewNutritionPlan,
  NewRecipe,
  NewUser,
  nutritionPlans, recipes, users,
} from "./schema";

type Database = ExpoSQLiteDatabase<typeof schema>;

export async function createUserProfile(db: Database, payload: NewUser) {
  await db.insert(users).values(payload);
}

export async function upsertUserProfile(db: Database, payload: NewUser) {
  await db
    .insert(users)
    .values(payload)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        ...payload,
        createdAt: undefined, // Don't overwrite createdAt on update
      },
    });
}

export async function getUserProfileById(db: Database, id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function updateUserProfile(db: Database, id: string, payload: Partial<NewUser>) {
  await db.update(users).set(payload).where(eq(users.id, id));
}

export async function deleteUserProfile(db: Database, id: string) {
  await db.delete(users).where(eq(users.id, id));
}

export async function createNutritionPlan(db: Database, payload: NewNutritionPlan) {
  await db.insert(nutritionPlans).values(payload);
}

export async function getActiveNutritionPlan(db: Database, userId: string) {
  const [plan] = await db
    .select()
    .from(nutritionPlans)
    .where(and(eq(nutritionPlans.userId, userId), eq(nutritionPlans.isActive, true)))
    .orderBy(desc(nutritionPlans.startDate));
  return plan ?? null;
}

export async function updateNutritionPlan(db: Database, id: string, payload: Partial<NewNutritionPlan>) {
  await db.update(nutritionPlans).set(payload).where(eq(nutritionPlans.id, id));
}

export async function deleteNutritionPlan(db: Database, id: string) {
  await db.delete(nutritionPlans).where(eq(nutritionPlans.id, id));
}

export async function createFoodItem(db: Database, payload: NewFood) {
  await db.insert(foods).values(payload);
}

export async function getFoodById(db: Database, id: string) {
  const [food] = await db.select().from(foods).where(eq(foods.id, id));
  return food ?? null;
}

export async function updateFoodItem(db: Database, id: string, payload: Partial<NewFood>) {
  await db.update(foods).set(payload).where(eq(foods.id, id));
}

export async function deleteFoodItem(db: Database, id: string) {
  await db.delete(foods).where(eq(foods.id, id));
}

export async function createMealLog(db: Database, payload: NewMealLog) {
  await db.insert(mealLogs).values(payload);
}

export async function getMealLogsByUserAndDate(db: Database, userId: string, date: string) {
  return db
    .select()
    .from(mealLogs)
    .where(and(eq(mealLogs.userId, userId), eq(mealLogs.date, date)))
    .orderBy(desc(mealLogs.createdAt));
}

export async function updateMealLog(db: Database, id: string, payload: Partial<NewMealLog>) {
  await db.update(mealLogs).set(payload).where(eq(mealLogs.id, id));
}

export async function deleteMealLog(db: Database, id: string) {
  await db.delete(mealLogs).where(eq(mealLogs.id, id));
}

export async function createDiaryEntry(db: Database, payload: NewDiaryEntry) {
  await db.insert(diary).values(payload);
}

export async function getDiaryEntriesByUserAndDate(db: Database, userId: string, date: string) {
  return db
    .select()
    .from(diary)
    .where(and(eq(diary.userId, userId), eq(diary.date, date)))
    .orderBy(desc(diary.createdAt));
}

export async function updateDiaryEntry(db: Database, id: string, payload: Partial<NewDiaryEntry>) {
  await db.update(diary).set(payload).where(eq(diary.id, id));
}

export async function deleteDiaryEntry(db: Database, id: string) {
  await db.delete(diary).where(eq(diary.id, id));
}

export async function createRecipe(db: Database, payload: NewRecipe) {
  await db.insert(recipes).values(payload);
}

export async function getRecipeById(db: Database, id: string) {
  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
  return recipe ?? null;
}

export async function updateRecipe(db: Database, id: string, payload: Partial<NewRecipe>) {
  await db.update(recipes).set(payload).where(eq(recipes.id, id));
}

export async function deleteRecipe(db: Database, id: string) {
  await db.delete(recipes).where(eq(recipes.id, id));
}

// Nutrition Plan Management with Calculator Integration
export async function getAllNutritionPlans(db: Database, userId: string) {
  return db
    .select()
    .from(nutritionPlans)
    .where(eq(nutritionPlans.userId, userId))
    .orderBy(desc(nutritionPlans.startDate));
}

export async function deactivateAllNutritionPlans(db: Database, userId: string) {
  await db
    .update(nutritionPlans)
    .set({ isActive: false })
    .where(eq(nutritionPlans.userId, userId));
}
