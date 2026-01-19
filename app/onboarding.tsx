import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DatePickerDialog from '@/components/date-picker';
import { Fonts } from '@/constants/theme';
import { useDatabase } from '@/src/db/client';
import { getUserProfileById, upsertUserProfile } from '@/src/db/queries';
import { createNutritionPlanForUser } from '@/src/services/nutritionPlanService';
import { getUserId } from '@/src/utils/userIdManager';
import Slider from '@react-native-community/slider';

const palette = {
  background: '#F5F5F7',
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
  border: '#E2E2E6',
};

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', value: 1.2, hint: 'Little or no exercise' },
  { label: 'Light', value: 1.375, hint: '1-3 days/week' },
  { label: 'Moderate', value: 1.55, hint: '3-5 days/week' },
  { label: 'Very Active', value: 1.725, hint: '6-7 days/week' },
  { label: 'Extra Active', value: 1.9, hint: 'Physical job or 2x training' },
];

const GOALS = [
  { label: 'Lose weight', value: 'lose' as const },
  { label: 'Maintain', value: 'maintain' as const },
  { label: 'Gain muscle', value: 'gain' as const },
];

type StepKey = 'welcome' | 'personal' | 'activity' | 'goal' | 'diet' | 'review';

const steps: { key: StepKey; title: string }[] = [
  { key: 'welcome', title: 'Welcome' },
  { key: 'personal', title: 'Personal' },
  { key: 'activity', title: 'Activity' },
  { key: 'goal', title: 'Goal' },
  { key: 'diet', title: 'Diet' },
  { key: 'review', title: 'Review' },
];

export default function OnboardingScreen() {
  const db = useDatabase();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState<number | null>(null);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain' | ''>('');
  const [targetWeightKg, setTargetWeightKg] = useState<number | null>(null);
  const [targetWeeks, setTargetWeeks] = useState(12);
  const [dietaryRestriction, setDietaryRestriction] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadExistingProfile() {
      const userId = await getUserId();
      const profile = await getUserProfileById(db, userId);
      console.log('loadExistingProfile', profile);
      if (!profile || !isMounted) return;
      if (profile.age) {
        const estimated = new Date();
        estimated.setFullYear(estimated.getFullYear() - Math.round(profile.age));
        setBirthDate(estimated);
      }
      setGender(profile.gender ?? '');
      setHeightCm(profile.heightCm?.toString() ?? '');
      setWeightKg(profile.weightKg?.toString() ?? '');
      setActivityLevel(profile.activityLevel ?? null);
      setGoal(profile.goal ?? '');
      setTargetWeightKg(profile.targetWeightKg ?? null);
      try {
        const restrictions = profile.dietaryRestrictions
          ? (JSON.parse(profile.dietaryRestrictions) as string[])
          : [];
        setDietaryRestriction(restrictions[0] ?? null);
      } catch {
        setDietaryRestriction(profile.dietaryRestrictions ?? null);
      }
    }
    loadExistingProfile();
    return () => {
      isMounted = false;
    };
  }, [db]);

  const currentStep = steps[stepIndex];
  const isLast = currentStep.key === 'review';
  const canSkip = currentStep.key === 'diet';

  const validateStep = (step: StepKey) => {
    const nextErrors: Record<string, string> = {};
    if (step === 'personal' || step === 'review') {
      if (!birthDate) nextErrors.birthDate = 'Please select your birthday.';
      if (!gender) nextErrors.gender = 'Please select a gender.';
      if (!isPositiveNumberInput(heightCm)) nextErrors.heightCm = 'Enter height in cm.';
      if (!isPositiveNumberInput(weightKg)) nextErrors.weightKg = 'Enter weight in kg.';
    }
    if ((step === 'activity' || step === 'review') && activityLevel === null) {
      nextErrors.activityLevel = 'Select an activity level.';
    }
    if ((step === 'goal' || step === 'review') && !goal) {
      nextErrors.goal = 'Select a goal.';
    }
    if ((step === 'goal' || step === 'review') && goal && goal !== 'maintain') {
      if (targetWeightKg === null) {
        nextErrors.targetWeightKg = 'Enter a target weight.';
      }
    }
    return nextErrors;
  };

  const stepErrors = validateStep(currentStep.key);
  const isStepValid = Object.keys(stepErrors).length === 0;

  const handleNext = () => {
    const nextErrors = validateStep(currentStep.key);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    setErrors({});
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const saveProfile = async () => {
    const nextErrors = validateStep('review');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    
    // Get or create unique user ID
    const userId = await getUserId();
    
    const now = new Date().toISOString();
    const payload = {
      id: userId,
      age: birthDate ? calculateAge(birthDate) : null,
      gender: gender || null,
      heightCm: heightCm ? Number(heightCm) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      activityLevel: activityLevel ?? null,
      goal: goal || null,
      targetWeightKg: targetWeightKg ?? null,
      dietaryRestrictions: JSON.stringify(parseDietaryRestrictions(dietaryRestriction)),
      createdAt: now,
      updatedAt: now,
    };

    await upsertUserProfile(db, payload);

    // Create nutrition plan after profile is saved
    try {
      await createNutritionPlanForUser({
        db,
        userId,
        makeActive: true,
      });
      console.log('✅ Nutrition plan created successfully');
    } catch (error) {
      console.error('❌ Failed to create nutrition plan:', error);
    }

    setIsSaving(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <StepIndicator currentIndex={stepIndex} />

          <View style={styles.card}>
            {currentStep.key === 'welcome' ? (
              <View style={styles.hero}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroEmoji}>🥗</Text>
                </View>
                <Text style={styles.heroTitle}>Welcome to AI Diet Planner</Text>
                <Text style={styles.heroSubtitle}>
                  Your personalized nutrition tracking assistant. Let&apos;s create a plan tailored to your goals.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.heading}>{steps[stepIndex].title}</Text>
                <Text style={styles.subtitle}>{stepDescription(currentStep.key)}</Text>
              </>
            )}

            {currentStep.key === 'personal' && (
              <View style={styles.section}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Birthday</Text>
                  <Text style={styles.helperText}>We use this to calculate your age.</Text>
                  <DatePickerDialog val={birthDate ?? new Date()} onValChange={setBirthDate} />
                  {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
                </View>
                <View style={styles.row}>
                  {['male', 'female', 'other'].map((value) => (
                    <SelectChip
                      key={value}
                      label={capitalize(value)}
                      isSelected={gender === value}
                      onPress={() => setGender(value as typeof gender)}
                    />
                  ))}
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                <LabeledInput
                  label="Height (cm)"
                  value={heightCm}
                  keyboardType="number-pad"
                  placeholder="e.g. 170"
                  onChangeText={setHeightCm}
                  error={errors.heightCm}
                />
                <LabeledInput
                  label="Weight (kg)"
                  value={weightKg}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 65.5"
                  onChangeText={setWeightKg}
                  error={errors.weightKg}
                />
              </View>
            )}

            {currentStep.key === 'activity' && (
              <View style={styles.section}>
                <Text style={styles.helperText}>
                  Choose the option that matches your weekly activity.
                </Text>
                {ACTIVITY_LEVELS.map((level) => (
                  <SelectRow
                    key={level.value}
                    title={level.label}
                    subtitle={level.hint}
                    isSelected={activityLevel === level.value}
                    onPress={() => setActivityLevel(level.value)}
                  />
                ))}
                {errors.activityLevel && <Text style={styles.errorText}>{errors.activityLevel}</Text>}
              </View>
            )}

            {currentStep.key === 'goal' && (
              <View style={styles.section}>
                <Text style={styles.helperText}>
                  Your goal helps us calculate your daily calorie target.
                </Text>
                <View style={styles.row}>
                  {GOALS.map((item) => (
                    <SelectChip
                      key={item.value}
                      label={item.label}
                      isSelected={goal === item.value}
                      onPress={() => {
                        setGoal(item.value);
                        if (item.value === 'maintain') {
                          setTargetWeightKg(null);
                        } else {
                          setTargetWeightKg(getCurrentWeight(weightKg));
                        }
                      }}
                    />
                  ))}
                </View>
                {errors.goal && <Text style={styles.errorText}>{errors.goal}</Text>}
                {goal && goal !== 'maintain' && (
                  <View style={styles.section}>
                    <Text style={styles.fieldLabel}>Target weight (kg)</Text>
                    <Text style={styles.helperText}>Drag to set your target weight.</Text>
                    <Slider
                      value={targetWeightKg ?? getCurrentWeight(weightKg)}
                      onValueChange={(value) => setTargetWeightKg(roundOneDecimal(value))}
                      minimumValue={getTargetWeightRange(weightKg, goal).min}
                      maximumValue={getTargetWeightRange(weightKg, goal).max}
                      step={0.1}
                      minimumTrackTintColor="#16A34A"
                      maximumTrackTintColor={palette.border}
                      thumbTintColor="#16A34A"
                    />
                    <Text style={styles.sliderValue}>
                      {(targetWeightKg ?? getCurrentWeight(weightKg)).toFixed(1)} kg
                    </Text>
                    {errors.targetWeightKg && <Text style={styles.errorText}>{errors.targetWeightKg}</Text>}

                    <Text style={[styles.fieldLabel, styles.sectionSpacing]}>Target completion date</Text>
                    <Text style={styles.helperText}>
                      Choose when you want to reach your goal ({targetWeeks} weeks)
                    </Text>
                    <Slider
                      value={targetWeeks}
                      onValueChange={(value) => setTargetWeeks(Math.round(value))}
                      minimumValue={4}
                      maximumValue={52}
                      step={1}
                      minimumTrackTintColor="#16A34A"
                      maximumTrackTintColor={palette.border}
                      thumbTintColor="#16A34A"
                    />
                    <Text style={styles.sliderValue}>{calculateTargetDate(targetWeeks)}</Text>
                    <GoalSummary
                      currentWeight={getCurrentWeight(weightKg)}
                      targetWeight={targetWeightKg ?? getCurrentWeight(weightKg)}
                      weeks={targetWeeks}
                      goal={goal}
                    />
                  </View>
                )}
              </View>
            )}

            {currentStep.key === 'diet' && (
              <View style={styles.section}>
                <Text style={styles.fieldLabel}>Diet preference</Text>
                <Text style={styles.helperText}>Choose one option or leave it blank.</Text>
                <View style={styles.row}>
                  {['Vegetarian', 'Vegan', 'Gluten-free', 'Low carb', 'Halal', 'Kosher'].map(
                    (option) => (
                      <SelectChip
                        key={option}
                        label={option}
                        isSelected={dietaryRestriction === option}
                        onPress={() =>
                          setDietaryRestriction(dietaryRestriction === option ? null : option)
                        }
                      />
                    ),
                  )}
                </View>
                {!dietaryRestriction && (
                  <Text style={styles.hintText}>No restriction selected. You can skip this step.</Text>
                )}
              </View>
            )}

            {currentStep.key === 'review' && (
              <View style={styles.section}>
                
                <InfoRow label="Birthday" value={birthDate ? formatDate(birthDate) : 'Not set'} />
                <InfoRow label="Gender" value={gender || 'Not set'} />
                <InfoRow label="Height" value={heightCm ? `${heightCm} cm` : 'Not set'} />
                <InfoRow label="Weight" value={weightKg ? `${weightKg} kg` : 'Not set'} />
                <InfoRow
                  label="Activity"
                  value={
                    activityLevel
                      ? ACTIVITY_LEVELS.find((level) => level.value === activityLevel)?.label ?? 'Not set'
                      : 'Not set'
                  }
                />
                <InfoRow label="Goal" value={goal ? capitalize(goal) : 'Not set'} />
                {goal && goal !== 'maintain' && (
                  <InfoRow
                    label="Target weight"
                    value={targetWeightKg !== null ? `${targetWeightKg.toFixed(1)} kg` : 'Not set'}
                  />
                )}
                <InfoRow
                  label="Dietary restrictions"
                  value={dietaryRestriction || 'None'}
                />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            {stepIndex > 0 && (
              <Pressable onPress={handleBack} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </Pressable>
            )}
            {canSkip && !isLast && (
              <Pressable onPress={handleSkip} style={styles.ghostButton}>
                <Text style={styles.ghostButtonText}>Skip</Text>
              </Pressable>
            )}
            {isLast ? (
              <Pressable
                onPress={saveProfile}
                style={[styles.primaryButton, (!isStepValid || isSaving) && styles.primaryButtonDisabled]}
                disabled={!isStepValid || isSaving}>
                <Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : 'Save Profile'}</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNext}
                style={[styles.primaryButton, !isStepValid && styles.primaryButtonDisabled]}
                disabled={!isStepValid}>
                <Text style={styles.primaryButtonText}>
                  {currentStep.key === 'welcome' ? 'Continue' : 'Next'}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function isPositiveNumberInput(value: string) {
  if (!value) return false;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

function parseDietaryRestrictions(value: string | null) {
  if (!value) return [];
  return [value];
}

function stepDescription(step: StepKey) {
  switch (step) {
    case 'welcome':
      return 'Quick setup to personalize your plan.';
    case 'personal':
      return 'Basic details for calorie and macro calculation.';
    case 'activity':
      return 'Tell us how active you are.';
    case 'goal':
      return 'Pick a goal and optional target weight.';
    case 'diet':
      return 'Optional dietary preferences and restrictions.';
    case 'review':
      return 'Confirm your details before saving.';
    default:
      return '';
  }
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDate(value: Date) {
  return value.toLocaleDateString();
}

function calculateTargetDate(weeks: number): string {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + weeks * 7);
  return `${targetDate.getFullYear()} / ${targetDate.getMonth() + 1} / ${targetDate.getDate()}`;
}

function calculateAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function getCurrentWeight(weightValue: string) {
  const parsed = Number(weightValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60;
  }
  return parsed;
}

function getTargetWeightRange(weightValue: string, goalValue: 'lose' | 'maintain' | 'gain') {
  const current = getCurrentWeight(weightValue);
  if (goalValue === 'lose') {
    return { min: Math.max(30, current - 20), max: current };
  }
  return { min: current, max: current + 20 };
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function StepIndicator({ currentIndex }: { currentIndex: number }) {
  return (
    <View style={styles.stepIndicator}>
      <View style={styles.progressTrack}>
        {steps.map((step, index) => (
          <View
            key={step.key}
            style={[
              styles.progressSegment,
              index <= currentIndex && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepCount}>Step {currentIndex + 1} of {steps.length}</Text>
    </View>
  );
}

function LabeledInput({
  label,
  value,
  placeholder,
  keyboardType,
  onChangeText,
  helperText,
  error,
}: {
  label: string;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  onChangeText: (text: string) => void;
  helperText?: string;
  error?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textTertiary}
        keyboardType={keyboardType}
        style={[styles.input, error && styles.inputError]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function SelectChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, isSelected && styles.chipSelected]}>
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function SelectRow({
  title,
  subtitle,
  isSelected,
  onPress,
}: {
  title: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.optionRow, isSelected && styles.optionRowSelected]}>
      <View>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.optionIndicator, isSelected && styles.optionIndicatorActive]} />
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function GoalSummary({
  currentWeight,
  targetWeight,
  weeks,
  goal,
}: {
  currentWeight: number;
  targetWeight: number;
  weeks: number;
  goal: 'lose' | 'maintain' | 'gain' | '';
}) {
  if (!goal || goal === 'maintain') return null;
  const delta = goal === 'lose' ? currentWeight - targetWeight : targetWeight - currentWeight;
  if (delta <= 0) {
    return (
      <View style={styles.goalSummary}>
        <Text style={styles.goalSummaryText}>
          Adjust your target weight to see a weekly progress estimate.
        </Text>
      </View>
    );
  }
  const weeklyChange = delta / weeks;
  const isReasonable = weeklyChange >= 0.25 && weeklyChange <= 1;
  const statusText = isReasonable
    ? 'This pace looks reasonable.'
    : 'This goal may be too aggressive.';
  return (
    <View style={styles.goalSummary}>
      <Text style={styles.goalSummaryText}>
        You will need to {goal === 'lose' ? 'lose' : 'gain'} about{' '}
        {weeklyChange.toFixed(2)} kg per week.
      </Text>
      <Text style={[styles.goalSummaryText, !isReasonable && styles.goalSummaryWarning]}>
        {statusText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: palette.background,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
    gap: 20,
    justifyContent: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    width: '70%',
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: palette.border,
  },
  progressSegmentActive: {
    backgroundColor: '#16A34A',
  },
  stepCount: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.softMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    gap: 12,
  },
  sectionSpacing: {
    marginTop: 8,
  },
  bodyText: {
    fontSize: 14,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
    lineHeight: 20,
  },
  helperText: {
    fontSize: 11,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  hintText: {
    fontSize: 11,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  input: {
    backgroundColor: palette.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: Fonts.rounded,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.border,
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 13,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  inputError: {
    borderColor: palette.accentOrange,
  },
  errorText: {
    fontSize: 11,
    color: palette.accentOrange,
    fontFamily: Fonts.rounded,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
    textAlign: 'right',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipSelected: {
    backgroundColor: palette.accentBlue,
    borderColor: palette.accentBlue,
  },
  chipText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  chipTextSelected: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  optionRow: {
    borderRadius: 14,
    backgroundColor: palette.background,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionRowSelected: {
    borderColor: palette.accentGreen,
    backgroundColor: palette.softMint,
  },
  optionTitle: {
    fontSize: 13,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  optionSubtitle: {
    fontSize: 11,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  optionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.border,
  },
  optionIndicatorActive: {
    borderColor: palette.accentGreen,
    backgroundColor: palette.accentGreen,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
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
  goalSummary: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.softMint,
    gap: 6,
  },
  goalSummaryText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  goalSummaryWarning: {
    color: palette.accentOrange,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#B7E3C6',
  },
  primaryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
  },
  secondaryButtonText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  ghostButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  ghostButtonText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
});
