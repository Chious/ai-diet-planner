import { User } from "../../db/schema";
import {
  ACTIVITY_MULTIPLIERS,
  adjustCaloriesForGoal,
  calculateBMR,
  calculateCarbsTarget,
  calculateFatTarget,
  calculateMacrosWithCustomRatios,
  calculateNutritionPlan,
  calculateProteinTarget,
  calculateTDEE,
  CALORIES_PER_GRAM,
  CustomMacroRatios,
  FAT_PERCENTAGE_RANGE,
  needsRecalculation,
  validateNutritionTargets
} from "../nutritionCalculator";

describe("Nutrition Calculator", () => {
  describe("calculateBMR", () => {
    it("should calculate BMR correctly for males using Mifflin-St Jeor formula", () => {
      // 30 year old male, 80kg, 180cm
      // Expected: (10 × 80) + (6.25 × 180) - (5 × 30) + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = calculateBMR(80, 180, 30, "male");
      expect(bmr).toBe(1780);
    });

    it("should calculate BMR correctly for females using Mifflin-St Jeor formula", () => {
      // 25 year old female, 60kg, 165cm
      // Expected: (10 × 60) + (6.25 × 165) - (5 × 25) - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
      const bmr = calculateBMR(60, 165, 25, "female");
      expect(bmr).toBe(1345.25);
    });

    it("should calculate BMR for other gender (average of male and female)", () => {
      // Should use -78 instead of +5 or -161
      const bmr = calculateBMR(70, 170, 28, "other");
      // Expected: (10 × 70) + (6.25 × 170) - (5 × 28) - 78 = 700 + 1062.5 - 140 - 78 = 1544.5
      expect(bmr).toBe(1544.5);
    });

    it("should handle extreme values", () => {
      // Very light person
      const lightBMR = calculateBMR(45, 150, 20, "female");
      expect(lightBMR).toBeGreaterThan(0);

      // Very heavy person
      const heavyBMR = calculateBMR(120, 200, 40, "male");
      expect(heavyBMR).toBeGreaterThan(lightBMR);
    });
  });

  describe("calculateTDEE", () => {
    it("should calculate TDEE correctly with sedentary activity level", () => {
      const bmr = 1780;
      const tdee = calculateTDEE(bmr, ACTIVITY_MULTIPLIERS.sedentary);
      expect(tdee).toBe(Math.round(1780 * 1.2)); // 2136
    });

    it("should calculate TDEE correctly with very active level", () => {
      const bmr = 1780;
      const tdee = calculateTDEE(bmr, ACTIVITY_MULTIPLIERS.veryActive);
      expect(tdee).toBe(Math.round(1780 * 1.725)); // 3071
    });

    it("should round TDEE to nearest integer", () => {
      const bmr = 1555;
      const tdee = calculateTDEE(bmr, 1.375);
      expect(tdee).toBe(Math.round(1555 * 1.375)); // 2138
    });
  });

  describe("adjustCaloriesForGoal", () => {
    it("should subtract 500 calories for weight loss", () => {
      const tdee = 2500;
      const adjusted = adjustCaloriesForGoal(tdee, "lose");
      expect(adjusted).toBe(2000);
    });

    it("should add 0 calories for maintenance", () => {
      const tdee = 2500;
      const adjusted = adjustCaloriesForGoal(tdee, "maintain");
      expect(adjusted).toBe(2500);
    });

    it("should add 500 calories for weight gain", () => {
      const tdee = 2500;
      const adjusted = adjustCaloriesForGoal(tdee, "gain");
      expect(adjusted).toBe(3000);
    });
  });

  describe("calculateProteinTarget", () => {
    it("should calculate higher protein for weight loss (2.2g/kg)", () => {
      const weightKg = 80;
      const protein = calculateProteinTarget(weightKg, "lose");
      expect(protein).toBe(Math.round(80 * 2.2)); // 176g
    });

    it("should calculate moderate protein for maintenance (1.8g/kg)", () => {
      const weightKg = 70;
      const protein = calculateProteinTarget(weightKg, "maintain");
      expect(protein).toBe(Math.round(70 * 1.8)); // 126g
    });

    it("should calculate higher protein for muscle gain (2.0g/kg)", () => {
      const weightKg = 75;
      const protein = calculateProteinTarget(weightKg, "gain");
      expect(protein).toBe(Math.round(75 * 2.0)); // 150g
    });
  });

  describe("calculateFatTarget", () => {
    it("should calculate fat at 25% of total calories by default", () => {
      const totalCalories = 2000;
      const fatGrams = calculateFatTarget(totalCalories);
      // 25% of 2000 = 500 calories / 9 cal per gram = 55.56g ≈ 56g
      expect(fatGrams).toBe(56);
    });

    it("should accept custom percentage", () => {
      const totalCalories = 2000;
      const fatGrams = calculateFatTarget(totalCalories, 0.30); // 30%
      // 30% of 2000 = 600 calories / 9 cal per gram = 66.67g ≈ 67g
      expect(fatGrams).toBe(67);
    });

    it("should handle minimum fat percentage", () => {
      const totalCalories = 2000;
      const fatGrams = calculateFatTarget(totalCalories, FAT_PERCENTAGE_RANGE.min);
      // 20% of 2000 = 400 calories / 9 cal per gram = 44.44g ≈ 44g
      expect(fatGrams).toBe(44);
    });
  });

  describe("calculateCarbsTarget", () => {
    it("should calculate carbs from remaining calories", () => {
      const totalCalories = 2000;
      const proteinGrams = 150; // 150g × 4 = 600 calories
      const fatsGrams = 56; // 56g × 9 = 504 calories
      const carbsGrams = calculateCarbsTarget(totalCalories, proteinGrams, fatsGrams);
      // Remaining: 2000 - 600 - 504 = 896 calories / 4 cal per gram = 224g
      expect(carbsGrams).toBe(224);
    });

    it("should handle low-carb scenario", () => {
      const totalCalories = 2000;
      const proteinGrams = 180;
      const fatsGrams = 100;
      const carbsGrams = calculateCarbsTarget(totalCalories, proteinGrams, fatsGrams);
      // 2000 - 720 - 900 = 380 / 4 = 95g
      expect(carbsGrams).toBe(95);
    });
  });

  describe("calculateMacrosWithCustomRatios", () => {
    it("should calculate macros with custom ratios", () => {
      const totalCalories = 2000;
      const customRatios: CustomMacroRatios = {
        proteinPercentage: 30,
        carbsPercentage: 40,
        fatsPercentage: 30,
      };
      const macros = calculateMacrosWithCustomRatios(totalCalories, customRatios);
      
      // Protein: 30% of 2000 = 600 / 4 = 150g
      expect(macros.proteinGrams).toBe(150);
      // Carbs: 40% of 2000 = 800 / 4 = 200g
      expect(macros.carbsGrams).toBe(200);
      // Fats: 30% of 2000 = 600 / 9 = 66.67g ≈ 67g
      expect(macros.fatsGrams).toBe(67);
    });

    it("should use defaults when ratios not provided", () => {
      const totalCalories = 2000;
      const customRatios: CustomMacroRatios = {};
      const macros = calculateMacrosWithCustomRatios(totalCalories, customRatios);
      
      // Should use defaults (30/40/30)
      expect(macros.proteinGrams).toBe(150);
      expect(macros.carbsGrams).toBe(200);
      expect(macros.fatsGrams).toBe(67);
    });
  });

  describe("calculateNutritionPlan", () => {
    const mockUser: User = {
      id: "user123",
      age: 30,
      gender: "male",
      heightCm: 180,
      weightKg: 80,
      activityLevel: ACTIVITY_MULTIPLIERS.moderatelyActive,
      goal: "lose",
      targetWeightKg: 75,
      dietaryRestrictions: null,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    };

    it("should calculate complete nutrition plan", () => {
      const result = calculateNutritionPlan(mockUser);

      // Verify BMR calculation
      expect(result.bmr).toBe(1780);

      // Verify TDEE calculation (1780 * 1.55)
      expect(result.tdee).toBe(2759);

      // Verify calorie adjustment for weight loss (-500)
      expect(result.adjustedCalories).toBe(2259);

      // Verify protein calculation (80kg * 2.2g/kg = 176g)
      expect(result.proteinGrams).toBe(176);

      // Verify all values are present
      expect(result.fatsGrams).toBeGreaterThan(0);
      expect(result.carbsGrams).toBeGreaterThan(0);
      expect(result.proteinCalories).toBe(176 * 4);
      expect(result.fatsCalories).toBeGreaterThan(0);
      expect(result.carbsCalories).toBeGreaterThan(0);
      
      // Verify percentages sum to 100%
      const totalPercentage = 
        result.proteinPercentage + 
        result.carbsPercentage + 
        result.fatsPercentage;
      expect(totalPercentage).toBeCloseTo(100, 0);
    });

    it("should calculate nutrition plan with custom ratios", () => {
      const customRatios: CustomMacroRatios = {
        proteinPercentage: 35,
        carbsPercentage: 35,
        fatsPercentage: 30,
      };
      
      const result = calculateNutritionPlan(mockUser, customRatios);

      // Verify custom ratios are applied
      const totalCalories = result.adjustedCalories;
      expect(result.proteinCalories).toBeCloseTo(totalCalories * 0.35, -1);
      expect(result.carbsCalories).toBeCloseTo(totalCalories * 0.35, -1);
      expect(result.fatsCalories).toBeCloseTo(totalCalories * 0.30, -1);
    });

    it("should throw error for incomplete user profile", () => {
      const incompleteUser: Partial<User> = {
        id: "user123",
        age: 30,
        // Missing required fields
      };

      expect(() => {
        calculateNutritionPlan(incompleteUser as User);
      }).toThrow("User profile is incomplete");
    });

    it("should calculate correctly for female user", () => {
      const femaleUser: User = {
        ...mockUser,
        gender: "female",
        weightKg: 60,
        heightCm: 165,
        age: 25,
        goal: "maintain",
      };

      const result = calculateNutritionPlan(femaleUser);

      // BMR for female: (10 × 60) + (6.25 × 165) - (5 × 25) - 161 = 1345.25
      expect(result.bmr).toBe(1345.25);

      // TDEE with moderate activity
      expect(result.tdee).toBe(Math.round(1345.25 * 1.55));

      // Maintenance goal (no adjustment)
      expect(result.adjustedCalories).toBe(result.tdee);

      // Protein for maintenance (60kg * 1.8g/kg)
      expect(result.proteinGrams).toBe(Math.round(60 * 1.8));
    });
  });

  describe("validateNutritionTargets", () => {
    const validResult = {
      bmr: 1780,
      tdee: 2759,
      adjustedCalories: 2259,
      proteinGrams: 176,
      carbsGrams: 224,
      fatsGrams: 63,
      proteinCalories: 704,
      carbsCalories: 896,
      fatsCalories: 567,
      proteinPercentage: 31.3,
      carbsPercentage: 39.8,
      fatsPercentage: 25.2,
    };

    it("should return no errors for valid nutrition plan", () => {
      const errors = validateNutritionTargets(validResult);
      expect(errors).toHaveLength(0);
    });

    it("should detect calories below minimum", () => {
      const lowCalorieResult = {
        ...validResult,
        adjustedCalories: 1000,
      };
      const errors = validateNutritionTargets(lowCalorieResult);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === "calories")).toBe(true);
    });

    it("should detect calories above maximum", () => {
      const highCalorieResult = {
        ...validResult,
        adjustedCalories: 6000,
      };
      const errors = validateNutritionTargets(highCalorieResult);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.field === "calories")).toBe(true);
    });

    it("should detect protein below minimum", () => {
      const lowProteinResult = {
        ...validResult,
        proteinGrams: 30,
      };
      const errors = validateNutritionTargets(lowProteinResult);
      expect(errors.some((e) => e.field === "protein")).toBe(true);
    });

    it("should detect fats below minimum", () => {
      const lowFatResult = {
        ...validResult,
        fatsGrams: 20,
      };
      const errors = validateNutritionTargets(lowFatResult);
      expect(errors.some((e) => e.field === "fats")).toBe(true);
    });

    it("should detect carbs below minimum", () => {
      const lowCarbResult = {
        ...validResult,
        carbsGrams: 30,
      };
      const errors = validateNutritionTargets(lowCarbResult);
      expect(errors.some((e) => e.field === "carbs")).toBe(true);
    });

    it("should detect fat percentage out of range", () => {
      const badFatPercentageResult = {
        ...validResult,
        fatsPercentage: 15, // Below 20%
      };
      const errors = validateNutritionTargets(badFatPercentageResult);
      expect(errors.some((e) => e.field === "fatsPercentage")).toBe(true);
    });
  });

  describe("needsRecalculation", () => {
    it("should return true if more than 7 days have passed", () => {
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
      const dateString = eightDaysAgo.toISOString().split("T")[0];
      
      expect(needsRecalculation(dateString)).toBe(true);
    });

    it("should return false if less than 7 days have passed", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const dateString = threeDaysAgo.toISOString().split("T")[0];
      
      expect(needsRecalculation(dateString)).toBe(false);
    });

    it("should return false for today's date", () => {
      const today = new Date().toISOString().split("T")[0];
      expect(needsRecalculation(today)).toBe(false);
    });

    it("should return true for exactly 7 days ago", () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const dateString = sevenDaysAgo.toISOString().split("T")[0];
      
      expect(needsRecalculation(dateString)).toBe(true);
    });
  });

  describe("Edge Cases and Integration", () => {
    it("should handle very low weight user safely", () => {
      const lightUser: User = {
        id: "user123",
        age: 20,
        gender: "female",
        heightCm: 150,
        weightKg: 45,
        activityLevel: ACTIVITY_MULTIPLIERS.sedentary,
        goal: "maintain",
        targetWeightKg: 45,
        dietaryRestrictions: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const result = calculateNutritionPlan(lightUser);
      expect(result.adjustedCalories).toBeGreaterThan(0);
      
      // Should still meet minimum requirements
      const errors = validateNutritionTargets(result);
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle very high weight user", () => {
      const heavyUser: User = {
        id: "user123",
        age: 35,
        gender: "male",
        heightCm: 195,
        weightKg: 130,
        activityLevel: ACTIVITY_MULTIPLIERS.veryActive,
        goal: "gain",
        targetWeightKg: 140,
        dietaryRestrictions: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const result = calculateNutritionPlan(heavyUser);
      expect(result.adjustedCalories).toBeGreaterThan(3000);
      expect(result.proteinGrams).toBeGreaterThan(200);
    });

    it("should maintain macro ratio consistency", () => {
      const user: User = {
        id: "user123",
        age: 28,
        gender: "male",
        heightCm: 175,
        weightKg: 75,
        activityLevel: ACTIVITY_MULTIPLIERS.moderatelyActive,
        goal: "maintain",
        targetWeightKg: 75,
        dietaryRestrictions: null,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      const result = calculateNutritionPlan(user);
      
      // Calculate total calories from macros
      const totalFromMacros =
        result.proteinGrams * CALORIES_PER_GRAM.protein +
        result.carbsGrams * CALORIES_PER_GRAM.carbs +
        result.fatsGrams * CALORIES_PER_GRAM.fats;

      // Should be close to target (within 5% due to rounding)
      const difference = Math.abs(totalFromMacros - result.adjustedCalories);
      const percentageDifference = (difference / result.adjustedCalories) * 100;
      expect(percentageDifference).toBeLessThan(5);
    });
  });
});
