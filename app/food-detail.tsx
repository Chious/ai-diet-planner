import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  softMint: '#E9F3E8',
  softLavender: '#EDEBFF',
  softPeach: '#FFE6E1',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#9A9AA0',
  accentGreen: '#9ED6A5',
  accentBlue: '#A8C9F5',
  accentPink: '#F1B7E8',
  accentOrange: '#F2B45B',
};

export default function FoodDetailScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroActions}>
            <View style={styles.iconButton}>
              <Feather name="arrow-left" size={18} color={palette.textPrimary} />
            </View>
            <View style={styles.iconButton}>
              <Feather name="heart" size={18} color={palette.textPrimary} />
            </View>
          </View>
          <View style={styles.heroImage}>
            <Text style={styles.heroEmoji}>🥣</Text>
          </View>
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

      <View style={styles.detailCard}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.foodTitle}>Oatmeal with Berries</Text>
            <Text style={styles.foodSubtitle}>250 kcal</Text>
          </View>
          <View style={styles.actionRow}>
            <View style={styles.actionButton}>
              <Feather name="download" size={16} color={palette.textSecondary} />
            </View>
            <View style={styles.actionButton}>
              <Feather name="share-2" size={16} color={palette.textSecondary} />
            </View>
          </View>
        </View>

        <View style={styles.macroRow}>
          <View style={[styles.macroChip, { backgroundColor: palette.softMint }]}>
            <Feather name="droplet" size={12} color={palette.accentBlue} />
            <Text style={styles.macroText}>40g</Text>
          </View>
          <View style={[styles.macroChip, { backgroundColor: palette.softLavender }]}>
            <Feather name="activity" size={12} color={palette.accentPink} />
            <Text style={styles.macroText}>10g</Text>
          </View>
          <View style={[styles.macroChip, { backgroundColor: palette.softPeach }]}>
            <Feather name="sun" size={12} color={palette.accentOrange} />
            <Text style={styles.macroText}>5g</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Warm and wholesome breakfast made from rolled oats simmered until creamy, topped with a
          mix of fresh berries for natural sweetness, antioxidants, and a burst of flavor.
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Servings</Text>
            <View style={styles.stepper}>
              <View style={styles.stepButton}>
                <Text style={styles.stepText}>-</Text>
              </View>
              <Text style={styles.stepValue}>1</Text>
              <View style={styles.stepButton}>
                <Text style={styles.stepText}>+</Text>
              </View>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Preparation</Text>
            <Text style={styles.infoValue}>5 Mins</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Cook</Text>
            <Text style={styles.infoValue}>20 mins</Text>
          </View>
        </View>
      </View>

      <View style={[styles.accordionCard, styles.accordionAccent]}>
        <View style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Directions</Text>
          <Feather name="chevron-down" size={18} color={palette.textPrimary} />
        </View>
      </View>

        <View style={[styles.accordionCard, styles.accordionLavender]}>
          <View style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Ingredients</Text>
            <Feather name="chevron-up" size={18} color={palette.textPrimary} />
          </View>
          <View style={styles.ingredientRow}>
            <Text style={styles.ingredientEmoji}>🍯</Text>
            <Text style={styles.ingredientName}>Honey</Text>
            <Text style={styles.ingredientAmount}>10 gr</Text>
          </View>
          <View style={styles.ingredientDivider} />
          <View style={styles.ingredientRow}>
            <Text style={styles.ingredientEmoji}>🫐</Text>
            <Text style={styles.ingredientName}>Berries</Text>
            <Text style={styles.ingredientAmount}>120 gr</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.background,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: palette.softMint,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroImage: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 140,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: '#C9D6C8',
  },
  dotActive: {
    width: 18,
    borderRadius: 999,
    backgroundColor: palette.accentGreen,
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
  detailCard: {
    backgroundColor: palette.surface,
    marginHorizontal: 20,
    marginTop: -24,
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  foodSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  macroText: {
    fontSize: 11,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  infoBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  infoDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E2E6',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  stepValue: {
    fontSize: 12,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  accordionCard: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    padding: 14,
  },
  accordionAccent: {
    backgroundColor: '#F5C070',
  },
  accordionLavender: {
    backgroundColor: palette.softLavender,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  ingredientEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  ingredientName: {
    flex: 1,
    fontSize: 12,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  ingredientAmount: {
    fontSize: 12,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  ingredientDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginTop: 10,
  },
});
