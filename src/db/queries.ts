import { and, desc, eq } from "drizzle-orm";

import {
  db,
  diary,
  foods,
  mealLogs,
  nutritionPlans,
  recipes,
  users,
} from "./index";
import {
  NewDiaryEntry,
  NewFood,
  NewMealLog,
  NewNutritionPlan,
  NewRecipe,
  NewUser,
} from "./schema";

export async function createUserProfile(payload: NewUser) {
  await db.insert(users).values(payload);
}

export async function getUserProfileById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function updateUserProfile(id: string, payload: Partial<NewUser>) {
  await db.update(users).set(payload).where(eq(users.id, id));
}

export async function deleteUserProfile(id: string) {
  await db.delete(users).where(eq(users.id, id));
}

export async function createNutritionPlan(payload: NewNutritionPlan) {
  await db.insert(nutritionPlans).values(payload);
}

export async function getActiveNutritionPlan(userId: string) {
  const [plan] = await db
    .select()
    .from(nutritionPlans)
    .where(and(eq(nutritionPlans.userId, userId), eq(nutritionPlans.isActive, true)))
    .orderBy(desc(nutritionPlans.startDate));
  return plan ?? null;
}

export async function updateNutritionPlan(id: string, payload: Partial<NewNutritionPlan>) {
  await db.update(nutritionPlans).set(payload).where(eq(nutritionPlans.id, id));
}

export async function deleteNutritionPlan(id: string) {
  await db.delete(nutritionPlans).where(eq(nutritionPlans.id, id));
}

export async function createFoodItem(payload: NewFood) {
  await db.insert(foods).values(payload);
}

export async function getFoodById(id: string) {
  const [food] = await db.select().from(foods).where(eq(foods.id, id));
  return food ?? null;
}

export async function updateFoodItem(id: string, payload: Partial<NewFood>) {
  await db.update(foods).set(payload).where(eq(foods.id, id));
}

export async function deleteFoodItem(id: string) {
  await db.delete(foods).where(eq(foods.id, id));
}

export async function createMealLog(payload: NewMealLog) {
  await db.insert(mealLogs).values(payload);
}

export async function getMealLogsByUserAndDate(userId: string, date: string) {
  return db
    .select()
    .from(mealLogs)
    .where(and(eq(mealLogs.userId, userId), eq(mealLogs.date, date)))
    .orderBy(desc(mealLogs.createdAt));
}

export async function updateMealLog(id: string, payload: Partial<NewMealLog>) {
  await db.update(mealLogs).set(payload).where(eq(mealLogs.id, id));
}

export async function deleteMealLog(id: string) {
  await db.delete(mealLogs).where(eq(mealLogs.id, id));
}

export async function createDiaryEntry(payload: NewDiaryEntry) {
  await db.insert(diary).values(payload);
}

export async function getDiaryEntriesByUserAndDate(userId: string, date: string) {
  return db
    .select()
    .from(diary)
    .where(and(eq(diary.userId, userId), eq(diary.date, date)))
    .orderBy(desc(diary.createdAt));
}

export async function updateDiaryEntry(id: string, payload: Partial<NewDiaryEntry>) {
  await db.update(diary).set(payload).where(eq(diary.id, id));
}

export async function deleteDiaryEntry(id: string) {
  await db.delete(diary).where(eq(diary.id, id));
}

export async function createRecipe(payload: NewRecipe) {
  await db.insert(recipes).values(payload);
}

export async function getRecipeById(id: string) {
  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
  return recipe ?? null;
}

export async function updateRecipe(id: string, payload: Partial<NewRecipe>) {
  await db.update(recipes).set(payload).where(eq(recipes.id, id));
}

export async function deleteRecipe(id: string) {
  await db.delete(recipes).where(eq(recipes.id, id));
}
