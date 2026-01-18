import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  divider: '#E6E6EB',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  accentBlue: '#7FB2E8',
  accentGreen: '#1CD760',
  accentBlueSoft: '#E8F2FB',
  accentGreenSoft: '#E9F9F0',
};

const weightPlanItems = [
  { label: 'Current Weight', value: '80 kg' },
  { label: 'Target Weight', value: '72 kg' },
];

const caloriePlanItems = [
  {
    icon: 'target',
    label: 'My Priority',
    value: 'Weekly Rate',
    helper: '',
  },
  {
    icon: 'calendar',
    label: 'Projected Target Date',
    value: 'May 10',
    helper: 'May change depending on how fast your progress is',
  },
  {
    icon: 'activity',
    label: 'Weekly Rate',
    value: 'Lose 1/2 kg',
    helper: 'Feedback and guidance keep your weekly rate steady',
  },
  {
    icon: 'coffee',
    label: 'Food Calorie Budget',
    value: '2,153',
    helper: "Note: exercise will not affect today's calorie budget",
    highlight: true,
  },
  {
    icon: 'wind',
    label: 'Weight Maintenance Cals',
    value: '2,704',
    helper: 'How much to eat to maintain your weight',
  },
];

export default function HabitsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.planHeader}>
        <View style={styles.planIcon}>
          <Feather name="trending-down" size={20} color={palette.accentBlue} />
        </View>
        <View style={styles.planText}>
          <Text style={styles.planTitle}>I plan to lose 8 kg in 111 days</Text>
          <Text style={styles.planSubtitle}>by eating less than 2,153 cals</Text>
        </View>
        <Feather name="chevron-down" size={20} color={palette.accentBlue} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weight Planning</Text>
        <View style={styles.sectionCard}>
          {weightPlanItems.map((item, index) => (
            <View key={item.label}>
              <View style={styles.rowItem}>
                <View style={styles.rowIcon}>
                  <Feather name="pie-chart" size={18} color={palette.accentBlue} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowValue}>{item.value}</Text>
              </View>
              {index === 0 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calorie Budget Planning</Text>
        <View style={styles.sectionCard}>
          {caloriePlanItems.map((item, index) => (
            <View key={item.label} style={styles.rowBlock}>
              <View style={styles.rowIcon}>
                <Feather name={item.icon as keyof typeof Feather.glyphMap} size={18} color="#67E18A" />
              </View>
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={[styles.rowValue, item.highlight && styles.rowValueHighlight]}>
                    {item.value}
                  </Text>
                </View>
                {item.helper ? <Text style={styles.rowHelper}>{item.helper}</Text> : null}
              </View>
              {index < caloriePlanItems.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
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
    gap: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 16,
  },
  planIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accentBlueSoft,
  },
  planText: {
    flex: 1,
    gap: 4,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  planSubtitle: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBlock: {
    gap: 12,
  },
  rowIcon: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: palette.accentGreenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  rowValue: {
    fontSize: 14,
    color: palette.accentBlue,
    fontFamily: Fonts.rounded,
  },
  rowValueHighlight: {
    color: palette.accentGreen,
    fontWeight: '700',
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowHelper: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  divider: {
    height: 1,
    backgroundColor: palette.divider,
    marginTop: 12,
  },
});
