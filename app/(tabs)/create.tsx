import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { foods } from '@/src/db';
import { desc, like, or } from 'drizzle-orm';
import { drizzle, useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#9A9AA0',
  softMint: '#E9F3E8',
  softBlue: '#DDEEFF',
  softLavender: '#EDEBFF',
  softPeach: '#FFE6E1',
};

type MealCard = {
  id?: string;
  name: string;
  kcal: string;
  color: keyof typeof palette;
  emoji: string;
  brand?: string | null;
};

const fallbackMeals: MealCard[] = [
  { name: 'Oatmeal with Berries', kcal: '250 kcal', color: 'softBlue', emoji: '🥣' },
  { name: 'Grilled Chicken Salad', kcal: '180 kcal', color: 'softMint', emoji: '🥗' },
  { name: 'Tofu Miso Soup', kcal: '120 kcal', color: 'softLavender', emoji: '🍲' },
  { name: 'Egg Pancake Roll', kcal: '150 kcal', color: 'softPeach', emoji: '🥚' },
];

export default function CreateScreen() {
  return <NativeCreateScreen />;
}

function NativeCreateScreen() {
  const sqliteDb = useSQLiteContext();
  const drizzleDb = useMemo(() => drizzle(sqliteDb), [sqliteDb]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTerm = searchQuery.trim();
  const { data: foodRows = [], error } = useLiveQuery(
    searchTerm
      ? drizzleDb
          .select()
          .from(foods)
          .where(
            or(
              like(foods.name, `%${searchTerm}%`),
              like(foods.brand, `%${searchTerm}%`),
            ),
          )
          .orderBy(desc(foods.id))
          .limit(100)
      : drizzleDb.select().from(foods).orderBy(desc(foods.id)).limit(50),
    [searchTerm],
  );
  const meals: MealCard[] = foodRows.length
    ? foodRows.map((food, index) => ({
        id: food.id,
        name: food.name,
        kcal: food.calories ? `${Math.round(food.calories)} kcal` : 'Calories unknown',
        color: (['softBlue', 'softMint', 'softLavender', 'softPeach'] as const)[index % 4],
        emoji: '🍽️',
        brand: food.brand,
      }))
    : fallbackMeals;


  console.log("foodRows: ", foodRows);
  return (
    <CreateContent meals={meals} error={error} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
  );
}

function CreateContent({
  meals,
  error,
  searchQuery,
  setSearchQuery,
}: {
  meals: MealCard[];
  error?: Error;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Pick a meal</Text>
        <Text style={styles.subtitle}>Choose a dish to log for your plan.</Text>
        {error && <Text style={styles.note}>Unable to load foods right now.</Text>}
        {setSearchQuery && (
          <TextInput
            placeholder="Search foods"
            placeholderTextColor={palette.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        )}
      </View>

      <View style={styles.list}>
        {meals.map((meal) => (
          <View key={String(meal.id ?? meal.name)} style={styles.mealCard}>
            <View style={[styles.mealIcon, { backgroundColor: palette[meal.color as keyof typeof palette] }]}>
              <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            </View>
            <View style={styles.mealBody}>
              <Text style={styles.mealTitle}>{meal.name}</Text>
              <Text style={styles.mealSubtitle}>
                {meal.kcal}
                {meal.brand ? ` · ${meal.brand}` : ''}
              </Text>
            </View>
          </View>
        ))}
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
    backgroundColor: palette.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  headerCard: {
    backgroundColor: palette.softMint,
    borderRadius: 20,
    padding: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    color: palette.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: Fonts.rounded,
    color: palette.textSecondary,
  },
  searchInput: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: Fonts.rounded,
    color: palette.textPrimary,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  note: {
    marginTop: 10,
    fontSize: 11,
    fontFamily: Fonts.rounded,
    color: palette.textTertiary,
  },
  list: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  mealIcon: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealBody: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  mealSubtitle: {
    fontSize: 12,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
    marginTop: 4,
  },
});
