import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import {
  createNutritionPlan,
  deactivateAllNutritionPlans,
  getActiveNutritionPlan,
  getAllNutritionPlans,
  getUserProfileById,
  updateNutritionPlan,
} from "../db/queries";
import { NewNutritionPlan, NutritionPlan } from "../db/schema";
import * as schema from "../db/schema";
import {
  calculateNutritionPlan,
  CustomMacroRatios,
  formatCustomRatios,
  needsRecalculation,
  NutritionCalculationResult,
  parseCustomRatios,
  validateNutritionTargets,
  ValidationError,
} from "./nutritionCalculator";

type Database = ExpoSQLiteDatabase<typeof schema>;

export interface CreateNutritionPlanOptions {
  db: Database;
  userId: string;
  customRatios?: CustomMacroRatios;
  startDate?: string; // YYYY-MM-DD format
  makeActive?: boolean; // Default: true
}

export interface RecalculateNutritionPlanOptions {
  db: Database;
  userId: string;
  customRatios?: CustomMacroRatios;
  forceRecalculation?: boolean; // Recalculate even if within 7 days
}

export interface NutritionPlanWithCalculation extends NutritionPlan {
  calculation: NutritionCalculationResult;
  validationErrors: ValidationError[];
}

/**
 * Generate a unique ID for nutrition plan
 * @returns Unique ID string
 */
function generateId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns Current date string
 */
function getCurrentDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Create a new nutrition plan for a user based on their profile
 * @param options - Creation options
 * @returns Created nutrition plan with calculation details
 * @throws Error if user profile is incomplete or validation fails
 */
export async function createNutritionPlanForUser(
  options: CreateNutritionPlanOptions
): Promise<NutritionPlanWithCalculation> {
  const { db, userId, customRatios, startDate, makeActive = true } = options;

  // Fetch user profile
  const user = await getUserProfileById(db, userId);
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Calculate nutrition plan
  const calculation = calculateNutritionPlan(user, customRatios);

  // Validate the calculated plan
  const validationErrors = validateNutritionTargets(calculation);
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map((e) => `${e.field}: ${e.message}`).join("\n");
    throw new Error(`Nutrition plan validation failed:\n${errorMessages}`);
  }

  // If making this plan active, deactivate all existing plans
  if (makeActive) {
    await deactivateAllNutritionPlans(db, userId);
  }

  // Create the nutrition plan record
  const planId = generateId();
  const currentDate = getCurrentDateString();
  
  const newPlan: NewNutritionPlan = {
    id: planId,
    userId,
    dailyCalories: calculation.adjustedCalories,
    proteinGrams: calculation.proteinGrams,
    carbsGrams: calculation.carbsGrams,
    fatsGrams: calculation.fatsGrams,
    customRatios: customRatios ? formatCustomRatios(customRatios) : null,
    startDate: startDate || currentDate,
    isActive: makeActive,
    createdAt: new Date().toISOString(),
  };

  await createNutritionPlan(db, newPlan);

  // Fetch and return the created plan with calculation
  const createdPlan = await getActiveNutritionPlan(db, userId);
  if (!createdPlan) {
    throw new Error("Failed to retrieve created nutrition plan");
  }

  return {
    ...createdPlan,
    calculation,
    validationErrors: [],
  };
}

/**
 * Get the active nutrition plan for a user with calculation details
 * @param db - Database instance
 * @param userId - User ID
 * @returns Active nutrition plan with calculation, or null if none exists
 */
export async function getActiveNutritionPlanWithDetails(
  db: Database,
  userId: string
): Promise<NutritionPlanWithCalculation | null> {
  const plan = await getActiveNutritionPlan(db, userId);
  if (!plan) {
    return null;
  }

  // Fetch user profile for recalculation verification
  const user = await getUserProfileById(db, userId);
  if (!user) {
    return null;
  }

  // Parse custom ratios if they exist
  const customRatios = plan.customRatios ? parseCustomRatios(plan.customRatios) : undefined;

  // Recalculate to get current details
  const calculation = calculateNutritionPlan(user, customRatios);
  const validationErrors = validateNutritionTargets(calculation);

  return {
    ...plan,
    calculation,
    validationErrors,
  };
}

/**
 * Check if a user's nutrition plan needs recalculation and optionally recalculate
 * @param options - Recalculation options
 * @returns Recalculated plan if recalculation occurred, null if no plan exists
 */
export async function recalculateNutritionPlanIfNeeded(
  options: RecalculateNutritionPlanOptions
): Promise<NutritionPlanWithCalculation | null> {
  const { db, userId, customRatios, forceRecalculation = false } = options;

  // Get current active plan
  const currentPlan = await getActiveNutritionPlan(db, userId);
  if (!currentPlan) {
    // No plan exists, create a new one
    return createNutritionPlanForUser({ db, userId, customRatios });
  }

  // Check if recalculation is needed
  const shouldRecalculate =
    forceRecalculation || needsRecalculation(currentPlan.startDate);

  if (!shouldRecalculate) {
    // No recalculation needed, return current plan with details
    return getActiveNutritionPlanWithDetails(db, userId);
  }

  // Fetch user profile
  const user = await getUserProfileById(db, userId);
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Use existing custom ratios if new ones aren't provided
  const ratiosToUse =
    customRatios || (currentPlan.customRatios ? parseCustomRatios(currentPlan.customRatios) : undefined);

  // Calculate new nutrition plan
  const calculation = calculateNutritionPlan(user, ratiosToUse);

  // Validate the calculated plan
  const validationErrors = validateNutritionTargets(calculation);
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map((e) => `${e.field}: ${e.message}`).join("\n");
    throw new Error(`Nutrition plan recalculation validation failed:\n${errorMessages}`);
  }

  // Deactivate current plan
  await updateNutritionPlan(db, currentPlan.id, { isActive: false });

  // Create new plan with updated values
  const planId = generateId();
  const currentDate = getCurrentDateString();

  const newPlan: NewNutritionPlan = {
    id: planId,
    userId,
    dailyCalories: calculation.adjustedCalories,
    proteinGrams: calculation.proteinGrams,
    carbsGrams: calculation.carbsGrams,
    fatsGrams: calculation.fatsGrams,
    customRatios: ratiosToUse ? formatCustomRatios(ratiosToUse) : null,
    startDate: currentDate,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  await createNutritionPlan(db, newPlan);

  // Fetch and return the new plan
  const updatedPlan = await getActiveNutritionPlan(db, userId);
  if (!updatedPlan) {
    throw new Error("Failed to retrieve recalculated nutrition plan");
  }

  return {
    ...updatedPlan,
    calculation,
    validationErrors: [],
  };
}

/**
 * Update custom macro ratios for a user's active nutrition plan
 * @param db - Database instance
 * @param userId - User ID
 * @param customRatios - New custom macro ratios
 * @returns Updated nutrition plan with calculation
 */
export async function updateNutritionPlanMacros(
  db: Database,
  userId: string,
  customRatios: CustomMacroRatios
): Promise<NutritionPlanWithCalculation> {
  // Validate that ratios sum to 100%
  const total =
    (customRatios.proteinPercentage ?? 0) +
    (customRatios.carbsPercentage ?? 0) +
    (customRatios.fatsPercentage ?? 0);

  if (Math.abs(total - 100) > 0.1) {
    throw new Error(
      `Custom macro ratios must sum to 100%. Current sum: ${total.toFixed(1)}%`
    );
  }

  // Get current active plan
  const currentPlan = await getActiveNutritionPlan(db, userId);
  if (!currentPlan) {
    throw new Error("No active nutrition plan found for user");
  }

  // Fetch user profile
  const user = await getUserProfileById(db, userId);
  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Recalculate with new ratios
  const calculation = calculateNutritionPlan(user, customRatios);

  // Validate
  const validationErrors = validateNutritionTargets(calculation);
  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map((e) => `${e.field}: ${e.message}`).join("\n");
    throw new Error(`Nutrition plan validation failed:\n${errorMessages}`);
  }

  // Update the plan
  await updateNutritionPlan(db, currentPlan.id, {
    dailyCalories: calculation.adjustedCalories,
    proteinGrams: calculation.proteinGrams,
    carbsGrams: calculation.carbsGrams,
    fatsGrams: calculation.fatsGrams,
    customRatios: formatCustomRatios(customRatios),
  });

  // Return updated plan
  const updatedPlan = await getActiveNutritionPlan(db, userId);
  if (!updatedPlan) {
    throw new Error("Failed to retrieve updated nutrition plan");
  }

  return {
    ...updatedPlan,
    calculation,
    validationErrors: [],
  };
}

/**
 * Get all nutrition plans for a user (active and historical)
 * @param db - Database instance
 * @param userId - User ID
 * @returns Array of all nutrition plans
 */
export async function getUserNutritionPlansHistory(
  db: Database,
  userId: string
): Promise<NutritionPlan[]> {
  return getAllNutritionPlans(db, userId);
}
