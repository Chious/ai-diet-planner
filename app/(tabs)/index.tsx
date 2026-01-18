import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  softMint: '#E9F3E8',
  softLavender: '#EDEBFF',
  softPeach: '#FFE6E1',
  softBlue: '#DDEEFF',
  softPink: '#F9D7FF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#9A9AA0',
  accentGreen: '#9ED6A5',
  accentBlue: '#A8C9F5',
  accentPink: '#F1B7E8',
  accentOrange: '#F2B45B',
};

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const weekDates = [13, 14, 15, 16, 17, 18, 19];

const meals = [
  {
    title: 'Oatmeal with Berries',
    kcal: 250,
    carbs: '40g',
    protein: '10g',
    fat: '5g',
    emoji: '🥣',
  },
  {
    title: 'Grilled Chicken Salad',
    kcal: 180,
    carbs: '40g',
    protein: '10g',
    fat: '5g',
    emoji: '🥗',
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👩🏻‍🍳</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.title}>Maria Joyce</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.iconButton}>
            <Feather name="search" size={18} color={palette.textSecondary} />
          </View>
          <View style={styles.iconButton}>
            <Feather name="bell" size={18} color={palette.textSecondary} />
          </View>
        </View>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calendarRow}>
          {weekDays.map((day, index) => (
            <Text key={`${day}-${index}`} style={styles.calendarDay}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.calendarRow}>
          {weekDates.map((date) => {
            const isActive = date === 16;
            return (
              <View
                key={date}
                style={[styles.calendarDate, isActive && styles.calendarDateActive]}>
                <Text style={[styles.calendarDateText, isActive && styles.calendarDateTextActive]}>
                  {date}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Daily Overview</Text>
      <View style={styles.overviewRow}>
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Calorie Budget</Text>
            <Feather name="more-vertical" size={16} color={palette.textTertiary} />
          </View>
          <View style={styles.budgetRingWrap}>
            <View style={styles.budgetRingBase} />
            <View style={styles.budgetRingProgress} />
            <View style={styles.budgetCenter}>
              <Text style={styles.budgetUsed}>1,669</Text>
              <Text style={styles.budgetLabel}>Left</Text>
              <Text style={styles.budgetLeft}>484</Text>
            </View>
          </View>
          <View style={styles.budgetFooter}>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Breakfast</Text>
              <Text style={styles.budgetStatValue}>585</Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Lunch</Text>
              <Text style={styles.budgetStatValue}>275</Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatLabel}>Dinner</Text>
              <Text style={styles.budgetStatValue}>659</Text>
            </View>
          </View>
        </View>
        <View style={styles.smallCardColumn}>
          <View style={[styles.smallCard, { backgroundColor: palette.softBlue }]}>
            <Text style={styles.cardLabel}>Carbs</Text>
            <Text style={styles.cardValue}>120 g / 250 g</Text>
            <View style={[styles.progressTrack, { backgroundColor: '#CFE5FF' }]}>
              <View style={[styles.progressFill, { width: '60%', backgroundColor: palette.accentBlue }]} />
            </View>
          </View>
          <View style={[styles.smallCard, { backgroundColor: palette.softPink }]}>
            <Text style={styles.cardLabel}>Protein</Text>
            <Text style={styles.cardValue}>65 g / 100 g</Text>
            <View style={[styles.progressTrack, { backgroundColor: '#F3D8FA' }]}>
              <View style={[styles.progressFill, { width: '65%', backgroundColor: palette.accentPink }]} />
            </View>
          </View>
          <View style={[styles.smallCard, { backgroundColor: palette.softPeach }]}>
            <Text style={styles.cardLabel}>Fat</Text>
            <Text style={styles.cardValue}>40 g / 70 g</Text>
            <View style={[styles.progressTrack, { backgroundColor: '#FFE6D3' }]}>
              <View style={[styles.progressFill, { width: '57%', backgroundColor: palette.accentOrange }]} />
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recently Logged</Text>
      <View style={styles.list}>
        {meals.map((meal) => (
          <View key={meal.title} style={styles.listItem}>
            <View style={styles.mealIcon}>
              <Text style={styles.mealIconText}>{meal.emoji}</Text>
            </View>
            <View style={styles.listBody}>
              <Text style={styles.listTitle}>{meal.title}</Text>
              <View style={styles.kcalRow}>
                <Text style={styles.kcalValue}>{meal.kcal}</Text>
                <Text style={styles.kcalUnit}>kcal</Text>
              </View>
            </View>
            <View style={styles.macroChips}>
              <View style={[styles.macroChip, { backgroundColor: palette.softBlue }]}>
                <Feather name="droplet" size={12} color={palette.accentBlue} />
                <Text style={styles.macroText}>{meal.carbs}</Text>
              </View>
              <View style={[styles.macroChip, { backgroundColor: palette.softLavender }]}>
                <Feather name="activity" size={12} color={palette.accentPink} />
                <Text style={styles.macroText}>{meal.protein}</Text>
              </View>
              <View style={[styles.macroChip, { backgroundColor: palette.softPeach }]}>
                <Feather name="sun" size={12} color={palette.accentOrange} />
                <Text style={styles.macroText}>{meal.fat}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: palette.softMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  greeting: {
    fontSize: 12,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  iconButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  calendarCard: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: 32,
    textAlign: 'center',
    fontSize: 11,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  calendarDate: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateActive: {
    backgroundColor: palette.accentGreen,
    borderColor: palette.accentGreen,
  },
  calendarDateText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  calendarDateTextActive: {
    color: palette.surface,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCardColumn: {
    flex: 1,
    gap: 12,
  },
  smallCard: {
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  budgetCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetTitle: {
    fontSize: 12,
    color: '#9BA1A6',
    fontFamily: Fonts.rounded,
  },
  budgetRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  budgetRingBase: {
    position: 'absolute',
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: '#2A2B2F',
  },
  budgetRingProgress: {
    position: 'absolute',
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: '#1CD760',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-40deg' }],
  },
  budgetCenter: {
    alignItems: 'center',
    gap: 4,
  },
  budgetUsed: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1CD760',
    fontFamily: Fonts.rounded,
  },
  budgetLabel: {
    fontSize: 11,
    color: '#9BA1A6',
    fontFamily: Fonts.rounded,
  },
  budgetLeft: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EDEFF2',
    fontFamily: Fonts.rounded,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStat: {
    gap: 4,
  },
  budgetStatLabel: {
    fontSize: 10,
    color: '#9BA1A6',
    fontFamily: Fonts.rounded,
  },
  budgetStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7FB2E8',
    fontFamily: Fonts.rounded,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: palette.surface,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  mealIcon: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: palette.softLavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealIconText: {
    fontSize: 20,
  },
  listBody: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  kcalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  kcalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  kcalUnit: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  macroChips: {
    gap: 6,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  macroText: {
    fontSize: 10,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
});
