import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

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

const mealOptions = [
  { name: 'Oatmeal with Berries', kcal: '250 kcal', color: 'softBlue', emoji: '🥣' },
  { name: 'Grilled Chicken Salad', kcal: '180 kcal', color: 'softMint', emoji: '🥗' },
  { name: 'Tofu Miso Soup', kcal: '120 kcal', color: 'softLavender', emoji: '🍲' },
  { name: 'Egg Pancake Roll', kcal: '150 kcal', color: 'softPeach', emoji: '🥚' },
];

export default function CreateScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Pick a meal</Text>
        <Text style={styles.subtitle}>Choose a dish to log for your plan.</Text>
      </View>

      <View style={styles.list}>
        {mealOptions.map((meal) => (
          <View key={meal.name} style={styles.mealCard}>
            <View style={[styles.mealIcon, { backgroundColor: palette[meal.color as keyof typeof palette] }]}>
              <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            </View>
            <View style={styles.mealBody}>
              <Text style={styles.mealTitle}>{meal.name}</Text>
              <Text style={styles.mealSubtitle}>{meal.kcal}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
