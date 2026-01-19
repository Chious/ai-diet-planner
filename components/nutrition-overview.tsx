import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useNutritionPlan } from '@/hooks/use-nutrition-plan';
import { getUserId } from '@/src/utils/userIdManager';

const palette = {
  surface: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#9A9AA0',
  accentGreen: '#9ED6A5',
  accentBlue: '#A8C9F5',
  accentPink: '#F1B7E8',
  accentOrange: '#F2B45B',
  softMint: '#E9F3E8',
  softLavender: '#EDEBFF',
  softPeach: '#FFE6E1',
  softBlue: '#DDEEFF',
  border: '#E2E2E6',
};

interface NutritionOverviewProps {
  userId?: string;
}

export function NutritionOverview({ userId: propUserId }: NutritionOverviewProps) {
  const [userId, setUserId] = useState<string | null>(propUserId || null);

  useEffect(() => {
    if (!propUserId) {
      getUserId().then(setUserId);
    }
  }, [propUserId]);

  const { plan, loading, error } = useNutritionPlan({
    userId: userId || '',
    autoLoad: !!userId,
    checkRecalculation: true,
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={palette.accentGreen} />
        <Text style={styles.loadingText}>Loading nutrition plan...</Text>
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={20} color={palette.accentOrange} />
        <Text style={styles.errorText}>
          {error || 'No nutrition plan found. Complete your profile to get started.'}
        </Text>
      </View>
    );
  }

  const { calculation } = plan;
  
  // Mock consumed values for demonstration (replace with actual daily tracking data)
  const consumed = {
    calories: 1200,
    protein: 80,
    carbs: 120,
    fats: 35,
  };

  const calorieProgress = (consumed.calories / plan.dailyCalories) * 100;
  const proteinProgress = (consumed.protein / plan.proteinGrams) * 100;
  const carbsProgress = (consumed.carbs / plan.carbsGrams) * 100;
  const fatsProgress = (consumed.fats / plan.fatsGrams) * 100;

  return (
    <View style={styles.container}>
      {/* Calorie Budget Card */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>Calorie Budget</Text>
          <Feather name="more-vertical" size={16} color={palette.textTertiary} />
        </View>
        <View style={styles.budgetRingWrap}>
          <View style={[styles.budgetRing, { opacity: 0.2 }]} />
          <View
            style={[
              styles.budgetRing,
              styles.budgetRingProgress,
              {
                borderTopColor: palette.accentGreen,
                borderRightColor: palette.accentGreen,
                transform: [
                  {
                    rotate: `${Math.min(calorieProgress * 3.6, 360)}deg`,
                  },
                ],
              },
            ]}
          />
          <View style={styles.budgetCenter}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={styles.budgetValue}>
              {Math.max(0, plan.dailyCalories - consumed.calories)}
            </Text>
            <Text style={styles.budgetUnit}>kcal</Text>
          </View>
        </View>
        <View style={styles.budgetFooter}>
          <View style={styles.budgetStat}>
            <Text style={styles.budgetStatLabel}>Base Goal</Text>
            <Text style={styles.budgetStatValue}>{plan.dailyCalories}</Text>
          </View>
          <View style={styles.budgetStatDivider} />
          <View style={styles.budgetStat}>
            <Text style={styles.budgetStatLabel}>Consumed</Text>
            <Text style={styles.budgetStatValue}>{consumed.calories}</Text>
          </View>
        </View>
      </View>

      {/* Macros Row */}
      <View style={styles.macrosRow}>
        {/* Protein */}
        <View style={[styles.macroCard, { backgroundColor: palette.softMint }]}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroTitle}>Protein</Text>
            <View style={[styles.macroIcon, { backgroundColor: palette.accentGreen }]}>
              <Text style={styles.macroEmoji}>🥩</Text>
            </View>
          </View>
          <Text style={styles.macroValue}>
            {consumed.protein}
            <Text style={styles.macroUnit}>/{plan.proteinGrams}g</Text>
          </Text>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroBarFill,
                {
                  width: `${Math.min(proteinProgress, 100)}%`,
                  backgroundColor: palette.accentGreen,
                },
              ]}
            />
          </View>
          <Text style={styles.macroPercentage}>
            {calculation.proteinPercentage.toFixed(0)}% of calories
          </Text>
        </View>

        {/* Carbs */}
        <View style={[styles.macroCard, { backgroundColor: palette.softLavender }]}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroTitle}>Carbs</Text>
            <View style={[styles.macroIcon, { backgroundColor: palette.accentBlue }]}>
              <Text style={styles.macroEmoji}>🍞</Text>
            </View>
          </View>
          <Text style={styles.macroValue}>
            {consumed.carbs}
            <Text style={styles.macroUnit}>/{plan.carbsGrams}g</Text>
          </Text>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroBarFill,
                {
                  width: `${Math.min(carbsProgress, 100)}%`,
                  backgroundColor: palette.accentBlue,
                },
              ]}
            />
          </View>
          <Text style={styles.macroPercentage}>
            {calculation.carbsPercentage.toFixed(0)}% of calories
          </Text>
        </View>

        {/* Fats */}
        <View style={[styles.macroCard, { backgroundColor: palette.softPeach }]}>
          <View style={styles.macroHeader}>
            <Text style={styles.macroTitle}>Fats</Text>
            <View style={[styles.macroIcon, { backgroundColor: palette.accentOrange }]}>
              <Text style={styles.macroEmoji}>🥑</Text>
            </View>
          </View>
          <Text style={styles.macroValue}>
            {consumed.fats}
            <Text style={styles.macroUnit}>/{plan.fatsGrams}g</Text>
          </Text>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroBarFill,
                {
                  width: `${Math.min(fatsProgress, 100)}%`,
                  backgroundColor: palette.accentOrange,
                },
              ]}
            />
          </View>
          <Text style={styles.macroPercentage}>
            {calculation.fatsPercentage.toFixed(0)}% of calories
          </Text>
        </View>
      </View>

      {/* Metabolic Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Your Metabolic Profile</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Basal Metabolic Rate (BMR)</Text>
          <Text style={styles.infoValue}>{calculation.bmr.toFixed(0)} cal/day</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Daily Energy (TDEE)</Text>
          <Text style={styles.infoValue}>{calculation.tdee.toFixed(0)} cal/day</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Target Calories</Text>
          <Text style={[styles.infoValue, styles.infoValueBold]}>
            {calculation.adjustedCalories.toFixed(0)} cal/day
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: palette.surface,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 14,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: palette.softPeach,
    borderRadius: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  budgetCard: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  budgetRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 160,
    marginBottom: 16,
  },
  budgetRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 12,
    borderColor: palette.border,
  },
  budgetRingProgress: {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  budgetCenter: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 10,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  budgetValue: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  budgetUnit: {
    fontSize: 10,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  budgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  budgetStat: {
    flex: 1,
    alignItems: 'center',
  },
  budgetStatLabel: {
    fontSize: 11,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  budgetStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
    marginTop: 2,
  },
  budgetStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: palette.border,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  macroIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroEmoji: {
    fontSize: 12,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
    marginBottom: 6,
  },
  macroUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: palette.textSecondary,
  },
  macroBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroPercentage: {
    fontSize: 9,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  infoCard: {
    backgroundColor: palette.softBlue,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  infoValue: {
    fontSize: 12,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  infoValueBold: {
    fontWeight: '700',
    fontSize: 14,
  },
});
