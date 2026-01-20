import { useDrizzle } from "@/src/context/database-provider";
import { CustomMacroRatios } from "@/src/services/nutritionCalculator";
import {
  createNutritionPlanForUser,
  getActiveNutritionPlanWithDetails,
  NutritionPlanWithCalculation,
  recalculateNutritionPlanIfNeeded,
  updateNutritionPlanMacros,
} from "@/src/services/nutritionPlanService";
import { useCallback, useEffect, useState } from "react";

interface UseNutritionPlanOptions {
  userId: string;
  autoLoad?: boolean; // Auto-load on mount
  checkRecalculation?: boolean; // Auto-check for recalculation on mount
}

interface UseNutritionPlanReturn {
  plan: NutritionPlanWithCalculation | null;
  loading: boolean;
  error: string | null;
  loadPlan: () => Promise<void>;
  createPlan: (customRatios?: CustomMacroRatios) => Promise<void>;
  recalculatePlan: (force?: boolean) => Promise<void>;
  updateMacros: (customRatios: CustomMacroRatios) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * React hook for managing nutrition plans
 * 
 * @example
 * ```typescript
 * function DashboardScreen() {
 *   const { plan, loading, error, loadPlan } = useNutritionPlan({
 *     userId: 'user123',
 *     autoLoad: true,
 *   });
 * 
 *   if (loading) return <ActivityIndicator />;
 *   if (error) return <Text>Error: {error}</Text>;
 *   if (!plan) return <Text>No active plan</Text>;
 * 
 *   return (
 *     <View>
 *       <Text>Calories: {plan.dailyCalories}</Text>
 *       <Text>Protein: {plan.proteinGrams}g</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useNutritionPlan(
  options: UseNutritionPlanOptions
): UseNutritionPlanReturn {
  const { userId, autoLoad = true, checkRecalculation = false } = options;
  const db = useDrizzle();

  const [plan, setPlan] = useState<NutritionPlanWithCalculation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load the active nutrition plan
   */
  const loadPlan = useCallback(async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activePlan = await getActiveNutritionPlanWithDetails(db, userId);
      setPlan(activePlan);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load nutrition plan";
      setError(errorMessage);
      console.error("Error loading nutrition plan:", err);
    } finally {
      setLoading(false);
    }
  }, [db, userId]);

  /**
   * Create a new nutrition plan
   */
  const createPlan = useCallback(
    async (customRatios?: CustomMacroRatios) => {
      if (!userId) {
        setError("User ID is required");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const newPlan = await createNutritionPlanForUser({
          db,
          userId,
          customRatios,
          makeActive: true,
        });
        setPlan(newPlan);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create nutrition plan";
        setError(errorMessage);
        console.error("Error creating nutrition plan:", err);
      } finally {
        setLoading(false);
      }
    },
    [db, userId]
  );

  /**
   * Recalculate the nutrition plan
   */
  const recalculatePlan = useCallback(
    async (force: boolean = false) => {
      if (!userId) {
        setError("User ID is required");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const recalculatedPlan = await recalculateNutritionPlanIfNeeded({
          db,
          userId,
          forceRecalculation: force,
        });
        setPlan(recalculatedPlan);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to recalculate nutrition plan";
        setError(errorMessage);
        console.error("Error recalculating nutrition plan:", err);
      } finally {
        setLoading(false);
      }
    },
    [db, userId]
  );

  /**
   * Update macro ratios
   */
  const updateMacros = useCallback(
    async (customRatios: CustomMacroRatios) => {
      if (!userId) {
        setError("User ID is required");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const updatedPlan = await updateNutritionPlanMacros(db, userId, customRatios);
        setPlan(updatedPlan);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update macro ratios";
        setError(errorMessage);
        console.error("Error updating macro ratios:", err);
      } finally {
        setLoading(false);
      }
    },
    [db, userId]
  );

  /**
   * Refresh the plan (reload from database)
   */
  const refresh = useCallback(async () => {
    await loadPlan();
  }, [loadPlan]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && userId) {
      if (checkRecalculation) {
        // Check for recalculation first
        recalculatePlan(false);
      } else {
        // Just load the plan
        loadPlan();
      }
    }
  }, [autoLoad, checkRecalculation, userId, loadPlan, recalculatePlan]);

  return {
    plan,
    loading,
    error,
    loadPlan,
    createPlan,
    recalculatePlan,
    updateMacros,
    refresh,
  };
}

/**
 * Hook for getting nutrition statistics
 */
export function useNutritionStats(plan: NutritionPlanWithCalculation | null) {
  if (!plan) {
    return null;
  }

  const { calculation } = plan;

  return {
    // Basic targets
    dailyCalories: plan.dailyCalories,
    proteinGrams: plan.proteinGrams,
    carbsGrams: plan.carbsGrams,
    fatsGrams: plan.fatsGrams,

    // Metabolic info
    bmr: calculation.bmr,
    tdee: calculation.tdee,

    // Macro breakdown
    macros: {
      protein: {
        grams: plan.proteinGrams,
        calories: calculation.proteinCalories,
        percentage: calculation.proteinPercentage,
      },
      carbs: {
        grams: plan.carbsGrams,
        calories: calculation.carbsCalories,
        percentage: calculation.carbsPercentage,
      },
      fats: {
        grams: plan.fatsGrams,
        calories: calculation.fatsCalories,
        percentage: calculation.fatsPercentage,
      },
    },

    // Validation
    hasWarnings: plan.validationErrors && plan.validationErrors.length > 0,
    warnings: plan.validationErrors,

    // Formatted strings for display
    formatted: {
      macroSplit: `${Math.round(calculation.proteinPercentage)}/${Math.round(calculation.carbsPercentage)}/${Math.round(calculation.fatsPercentage)}`,
      macroGrams: `${plan.proteinGrams}P / ${plan.carbsGrams}C / ${plan.fatsGrams}F`,
      dailyCaloriesWithUnit: `${plan.dailyCalories} cal`,
    },
  };
}
