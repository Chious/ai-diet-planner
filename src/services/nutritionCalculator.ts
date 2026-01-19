import { User } from "../db/schema";

/**
 * Activity level multipliers for TDEE calculation
 */
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightlyActive: 1.375,
  moderatelyActive: 1.55,
  veryActive: 1.725,
  extraActive: 1.9,
} as const;

/**
 * Goal-based calorie adjustments
 */
export const GOAL_CALORIE_ADJUSTMENTS = {
  lose: -500,
  maintain: 0,
  gain: 500,
} as const;

/**
 * Protein targets based on goal (grams per kg body weight)
 */
export const PROTEIN_TARGETS = {
  lose: 2.2, // Higher protein during weight loss to preserve muscle
  maintain: 1.8,
  gain: 2.0, // Higher protein during muscle gain
} as const;

/**
 * Fat percentage range of total calories
 */
export const FAT_PERCENTAGE_RANGE = {
  min: 0.20, // 20% of total calories
  max: 0.35, // 35% of total calories
  default: 0.25, // 25% of total calories
} as const;

/**
 * Calories per gram for each macronutrient
 */
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
} as const;

/**
 * Validation thresholds
 */
export const VALIDATION_THRESHOLDS = {
  minCalories: 1200, // Minimum daily calories for safety
  maxCalories: 5000, // Maximum daily calories (for athletes)
  minProteinGrams: 50, // Minimum protein grams per day
  minFatGrams: 30, // Minimum fat grams per day
  minCarbsGrams: 50, // Minimum carbs grams per day
} as const;

export interface NutritionCalculationResult {
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  adjustedCalories: number; // Calories adjusted for goal
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  proteinCalories: number;
  carbsCalories: number;
  fatsCalories: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatsPercentage: number;
}

export interface CustomMacroRatios {
  proteinPercentage?: number; // 0-100
  carbsPercentage?: number; // 0-100
  fatsPercentage?: number; // 0-100
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula
 * @param weightKg - Body weight in kilograms
 * @param heightCm - Height in centimeters
 * @param age - Age in years
 * @param gender - Biological sex
 * @returns BMR in calories
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: "male" | "female" | "other"
): number {
  // Base calculation (same for all)
  const baseCalc = 10 * weightKg + 6.25 * heightCm - 5 * age;

  // Gender-specific adjustment
  if (gender === "male") {
    return baseCalc + 5;
  } else if (gender === "female") {
    return baseCalc - 161;
  } else {
    // For "other", use average of male and female
    return baseCalc - 78;
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param bmr - Basal Metabolic Rate
 * @param activityLevel - Activity level multiplier (1.2 - 1.9)
 * @returns TDEE in calories
 */
export function calculateTDEE(bmr: number, activityLevel: number): number {
  return Math.round(bmr * activityLevel);
}

/**
 * Adjust calories based on goal
 * @param tdee - Total Daily Energy Expenditure
 * @param goal - Weight goal (lose, maintain, gain)
 * @returns Adjusted calorie target
 */
export function adjustCaloriesForGoal(
  tdee: number,
  goal: "lose" | "maintain" | "gain"
): number {
  const adjustment = GOAL_CALORIE_ADJUSTMENTS[goal];
  return Math.round(tdee + adjustment);
}

/**
 * Calculate protein target in grams
 * @param weightKg - Body weight in kilograms
 * @param goal - Weight goal
 * @returns Protein target in grams
 */
export function calculateProteinTarget(
  weightKg: number,
  goal: "lose" | "maintain" | "gain"
): number {
  const gramsPerKg = PROTEIN_TARGETS[goal];
  return Math.round(weightKg * gramsPerKg);
}

/**
 * Calculate fat target in grams (25% of total calories by default)
 * @param totalCalories - Total daily calorie target
 * @param percentage - Optional custom percentage (0-1)
 * @returns Fat target in grams
 */
export function calculateFatTarget(
  totalCalories: number,
  percentage: number = FAT_PERCENTAGE_RANGE.default
): number {
  const fatCalories = totalCalories * percentage;
  return Math.round(fatCalories / CALORIES_PER_GRAM.fats);
}

/**
 * Calculate carbs target (remaining calories after protein and fats)
 * @param totalCalories - Total daily calorie target
 * @param proteinGrams - Protein target in grams
 * @param fatsGrams - Fat target in grams
 * @returns Carbs target in grams
 */
export function calculateCarbsTarget(
  totalCalories: number,
  proteinGrams: number,
  fatsGrams: number
): number {
  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;
  const fatCalories = fatsGrams * CALORIES_PER_GRAM.fats;
  const remainingCalories = totalCalories - proteinCalories - fatCalories;
  return Math.round(remainingCalories / CALORIES_PER_GRAM.carbs);
}

/**
 * Calculate macros with custom ratios
 * @param totalCalories - Total daily calorie target
 * @param customRatios - Custom macro percentage ratios
 * @returns Macro targets in grams
 */
export function calculateMacrosWithCustomRatios(
  totalCalories: number,
  customRatios: CustomMacroRatios
): { proteinGrams: number; carbsGrams: number; fatsGrams: number } {
  const proteinPercent = (customRatios.proteinPercentage ?? 30) / 100;
  const carbsPercent = (customRatios.carbsPercentage ?? 40) / 100;
  const fatsPercent = (customRatios.fatsPercentage ?? 30) / 100;

  const proteinCalories = totalCalories * proteinPercent;
  const carbsCalories = totalCalories * carbsPercent;
  const fatsCalories = totalCalories * fatsPercent;

  return {
    proteinGrams: Math.round(proteinCalories / CALORIES_PER_GRAM.protein),
    carbsGrams: Math.round(carbsCalories / CALORIES_PER_GRAM.carbs),
    fatsGrams: Math.round(fatsCalories / CALORIES_PER_GRAM.fats),
  };
}

/**
 * Validate nutrition targets to prevent unhealthy values
 * @param result - Nutrition calculation result
 * @returns Array of validation errors (empty if valid)
 */
export function validateNutritionTargets(
  result: NutritionCalculationResult
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate total calories
  if (result.adjustedCalories < VALIDATION_THRESHOLDS.minCalories) {
    errors.push({
      field: "calories",
      message: `Daily calories (${result.adjustedCalories}) are below the safe minimum of ${VALIDATION_THRESHOLDS.minCalories}. Please adjust your goals.`,
    });
  }

  if (result.adjustedCalories > VALIDATION_THRESHOLDS.maxCalories) {
    errors.push({
      field: "calories",
      message: `Daily calories (${result.adjustedCalories}) exceed the maximum of ${VALIDATION_THRESHOLDS.maxCalories}. Please review your activity level and goals.`,
    });
  }

  // Validate protein
  if (result.proteinGrams < VALIDATION_THRESHOLDS.minProteinGrams) {
    errors.push({
      field: "protein",
      message: `Protein target (${result.proteinGrams}g) is below the safe minimum of ${VALIDATION_THRESHOLDS.minProteinGrams}g.`,
    });
  }

  // Validate fats
  if (result.fatsGrams < VALIDATION_THRESHOLDS.minFatGrams) {
    errors.push({
      field: "fats",
      message: `Fat target (${result.fatsGrams}g) is below the safe minimum of ${VALIDATION_THRESHOLDS.minFatGrams}g. Fats are essential for hormone production.`,
    });
  }

  // Validate carbs
  if (result.carbsGrams < VALIDATION_THRESHOLDS.minCarbsGrams) {
    errors.push({
      field: "carbs",
      message: `Carbohydrate target (${result.carbsGrams}g) is below the safe minimum of ${VALIDATION_THRESHOLDS.minCarbsGrams}g.`,
    });
  }

  // Validate fat percentage range
  if (
    result.fatsPercentage < FAT_PERCENTAGE_RANGE.min * 100 ||
    result.fatsPercentage > FAT_PERCENTAGE_RANGE.max * 100
  ) {
    errors.push({
      field: "fatsPercentage",
      message: `Fat percentage (${result.fatsPercentage.toFixed(1)}%) should be between ${FAT_PERCENTAGE_RANGE.min * 100}% and ${FAT_PERCENTAGE_RANGE.max * 100}% of total calories.`,
    });
  }

  return errors;
}

/**
 * Calculate complete nutrition plan based on user profile
 * @param user - User profile data
 * @param customRatios - Optional custom macro ratios
 * @returns Nutrition calculation result with all targets
 */
export function calculateNutritionPlan(
  user: User,
  customRatios?: CustomMacroRatios
): NutritionCalculationResult {
  // Validate required fields
  if (!user.age || !user.gender || !user.heightCm || !user.weightKg || !user.activityLevel || !user.goal) {
    throw new Error("User profile is incomplete. Missing required fields for nutrition calculation.");
  }

  // Step 1: Calculate BMR
  const bmr = calculateBMR(user.weightKg, user.heightCm, user.age, user.gender);

  // Step 2: Calculate TDEE
  const tdee = calculateTDEE(bmr, user.activityLevel);

  // Step 3: Adjust for goal
  const adjustedCalories = adjustCaloriesForGoal(tdee, user.goal);

  // Step 4: Calculate macronutrients
  let proteinGrams: number;
  let carbsGrams: number;
  let fatsGrams: number;

  if (customRatios && 
      customRatios.proteinPercentage !== undefined && 
      customRatios.carbsPercentage !== undefined && 
      customRatios.fatsPercentage !== undefined) {
    // Use custom ratios if provided
    const macros = calculateMacrosWithCustomRatios(adjustedCalories, customRatios);
    proteinGrams = macros.proteinGrams;
    carbsGrams = macros.carbsGrams;
    fatsGrams = macros.fatsGrams;
  } else {
    // Use standard calculation
    proteinGrams = calculateProteinTarget(user.weightKg, user.goal);
    fatsGrams = calculateFatTarget(adjustedCalories);
    carbsGrams = calculateCarbsTarget(adjustedCalories, proteinGrams, fatsGrams);
  }

  // Calculate calorie breakdown
  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein;
  const carbsCalories = carbsGrams * CALORIES_PER_GRAM.carbs;
  const fatsCalories = fatsGrams * CALORIES_PER_GRAM.fats;

  // Calculate percentages
  const totalMacroCalories = proteinCalories + carbsCalories + fatsCalories;
  const proteinPercentage = (proteinCalories / totalMacroCalories) * 100;
  const carbsPercentage = (carbsCalories / totalMacroCalories) * 100;
  const fatsPercentage = (fatsCalories / totalMacroCalories) * 100;

  const result: NutritionCalculationResult = {
    bmr,
    tdee,
    adjustedCalories,
    proteinGrams,
    carbsGrams,
    fatsGrams,
    proteinCalories,
    carbsCalories,
    fatsCalories,
    proteinPercentage,
    carbsPercentage,
    fatsPercentage,
  };

  return result;
}

/**
 * Format custom ratios for storage
 * @param ratios - Custom macro ratios
 * @returns JSON string
 */
export function formatCustomRatios(ratios: CustomMacroRatios): string {
  return JSON.stringify(ratios);
}

/**
 * Parse custom ratios from storage
 * @param ratiosJson - JSON string of custom ratios
 * @returns Custom macro ratios object
 */
export function parseCustomRatios(ratiosJson: string): CustomMacroRatios {
  try {
    return JSON.parse(ratiosJson);
  } catch (error) {
    return {};
  }
}

/**
 * Check if user profile needs recalculation (e.g., weekly updates)
 * @param lastCalculationDate - Date of last calculation (YYYY-MM-DD)
 * @returns True if recalculation is needed
 */
export function needsRecalculation(lastCalculationDate: string): boolean {
  const lastDate = new Date(lastCalculationDate);
  const today = new Date();
  const daysDifference = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Recalculate if more than 7 days have passed
  return daysDifference >= 7;
}
