import { Feather } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useNutritionPlan } from '@/hooks/use-nutrition-plan';
import Slider from '@react-native-community/slider';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#9A9AA0',
  accentGreen: '#9ED6A5',
  accentBlue: '#A8C9F5',
  accentOrange: '#F2B45B',
  softMint: '#E9F3E8',
  softLavender: '#EDEBFF',
  softPeach: '#FFE6E1',
  border: '#E2E2E6',
};

const USER_ID = 'user-1'; // Replace with actual user ID from auth context

export default function CustomizeMacrosScreen() {
  const { plan, loading, updateMacros } = useNutritionPlan({
    userId: USER_ID,
    autoLoad: true,
  });

  const [proteinPercent, setProteinPercent] = useState(30);
  const [carbsPercent, setCarbsPercent] = useState(40);
  const [fatsPercent, setFatsPercent] = useState(30);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize sliders with current plan values
  useState(() => {
    if (plan?.calculation) {
      setProteinPercent(Math.round(plan.calculation.proteinPercentage));
      setCarbsPercent(Math.round(plan.calculation.carbsPercentage));
      setFatsPercent(Math.round(plan.calculation.fatsPercentage));
    }
  });

  const totalPercent = proteinPercent + carbsPercent + fatsPercent;
  const isValid = Math.abs(totalPercent - 100) < 0.5;

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('Invalid Ratios', 'Macro percentages must sum to 100%');
      return;
    }

    setIsSaving(true);
    try {
      await updateMacros({
        proteinPercentage: proteinPercent,
        carbsPercentage: carbsPercent,
        fatsPercentage: fatsPercent,
      });
      Alert.alert('Success', 'Your macro targets have been updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update macros');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (plan?.calculation) {
      setProteinPercent(Math.round(plan.calculation.proteinPercentage));
      setCarbsPercent(Math.round(plan.calculation.carbsPercentage));
      setFatsPercent(Math.round(plan.calculation.fatsPercentage));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.accentGreen} />
          <Text style={styles.loadingText}>Loading nutrition plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!plan) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={palette.accentOrange} />
          <Text style={styles.errorTitle}>No Nutrition Plan</Text>
          <Text style={styles.errorText}>
            Complete your profile to create a nutrition plan first.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { dailyCalories } = plan;

  // Calculate grams from percentages
  const proteinGrams = Math.round((dailyCalories * (proteinPercent / 100)) / 4);
  const carbsGrams = Math.round((dailyCalories * (carbsPercent / 100)) / 4);
  const fatsGrams = Math.round((dailyCalories * (fatsPercent / 100)) / 9);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Customize Macros</Text>
            <Text style={styles.headerSubtitle}>Adjust your macro ratio targets</Text>
          </View>
        </View>

        {/* Current Targets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Daily Target</Text>
          <Text style={styles.calorieValue}>{dailyCalories} calories</Text>
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{proteinGrams}g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{carbsGrams}g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{fatsGrams}g</Text>
            </View>
          </View>
        </View>

        {/* Total Percentage Indicator */}
        <View
          style={[
            styles.totalCard,
            {
              backgroundColor: isValid ? palette.softMint : palette.softPeach,
            },
          ]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Percentage</Text>
            <Text
              style={[
                styles.totalValue,
                { color: isValid ? palette.accentGreen : palette.accentOrange },
              ]}>
              {totalPercent.toFixed(0)}%
            </Text>
          </View>
          {!isValid && (
            <Text style={styles.totalWarning}>Macros must sum to 100%</Text>
          )}
        </View>

        {/* Protein Slider */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderTitleRow}>
              <Text style={styles.sliderEmoji}>🥩</Text>
              <Text style={styles.sliderTitle}>Protein</Text>
            </View>
            <Text style={styles.sliderValue}>{proteinPercent}%</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={50}
            value={proteinPercent}
            onValueChange={setProteinPercent}
            minimumTrackTintColor={palette.accentGreen}
            maximumTrackTintColor={palette.border}
            thumbTintColor={palette.accentGreen}
            step={1}
          />
          <Text style={styles.sliderInfo}>{proteinGrams}g per day</Text>
        </View>

        {/* Carbs Slider */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderTitleRow}>
              <Text style={styles.sliderEmoji}>🍞</Text>
              <Text style={styles.sliderTitle}>Carbohydrates</Text>
            </View>
            <Text style={styles.sliderValue}>{carbsPercent}%</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={60}
            value={carbsPercent}
            onValueChange={setCarbsPercent}
            minimumTrackTintColor={palette.accentBlue}
            maximumTrackTintColor={palette.border}
            thumbTintColor={palette.accentBlue}
            step={1}
          />
          <Text style={styles.sliderInfo}>{carbsGrams}g per day</Text>
        </View>

        {/* Fats Slider */}
        <View style={styles.sliderCard}>
          <View style={styles.sliderHeader}>
            <View style={styles.sliderTitleRow}>
              <Text style={styles.sliderEmoji}>🥑</Text>
              <Text style={styles.sliderTitle}>Fats</Text>
            </View>
            <Text style={styles.sliderValue}>{fatsPercent}%</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={15}
            maximumValue={45}
            value={fatsPercent}
            onValueChange={setFatsPercent}
            minimumTrackTintColor={palette.accentOrange}
            maximumTrackTintColor={palette.border}
            thumbTintColor={palette.accentOrange}
            step={1}
          />
          <Text style={styles.sliderInfo}>{fatsGrams}g per day</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Feather name="info" size={16} color={palette.textSecondary} />
          <Text style={styles.infoText}>
            Adjust the sliders to customize your macro ratio. The percentages must sum to
            100% before you can save.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <Pressable style={styles.secondaryButton} onPress={handleReset}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, (!isValid || isSaving) && styles.primaryButtonDisabled]}
            onPress={handleSave}
            disabled={!isValid || isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  errorText: {
    fontSize: 14,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  headerSubtitle: {
    fontSize: 13,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
    marginTop: 2,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
    marginBottom: 16,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 16,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 11,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
    marginTop: 4,
  },
  totalCard: {
    borderRadius: 16,
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  totalWarning: {
    fontSize: 12,
    color: palette.accentOrange,
    fontFamily: Fonts.rounded,
    marginTop: 4,
  },
  sliderCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderEmoji: {
    fontSize: 20,
  },
  sliderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderInfo: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: palette.softLavender,
    borderRadius: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#B7E3C6',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
});
