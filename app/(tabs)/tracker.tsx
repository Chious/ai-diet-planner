import { Feather } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textTertiary: '#9A9AA0',
  softBlue: '#DDEEFF',
  softLavender: '#EDEBFF',
  accentGreen: '#9ED6A5',
  accentBlue: '#CDE9F5',
  accentPurple: '#B9B2F5',
};

const weekBars = [
  { top: 36, bottom: 46 },
  { top: 44, bottom: 52 },
  { top: 28, bottom: 36 },
  { top: 52, bottom: 46 },
  { top: 58, bottom: 52 },
  { top: 32, bottom: 30 },
  { top: 46, bottom: 40 },
];

const weekLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function TrackerScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.backButton}>
          <Feather name="chevron-left" size={20} color={palette.textPrimary} />
        </View>
        <Text style={styles.headerTitle}>Statistic</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.segmented}>
        {['Day', 'Week', 'Month', 'Year'].map((label) => {
          const isActive = label === 'Week';
          return (
            <View key={label} style={[styles.segment, isActive && styles.segmentActive]}>
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{label}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Nutrition</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.metricGroup}>
            <Text style={styles.metricValue}>12.873</Text>
            <Text style={styles.metricLabel}>Total Calories</Text>
          </View>
          <View style={styles.metricGroup}>
            <Text style={styles.metricValue}>1.839</Text>
            <Text style={styles.metricLabel}>Daily Average</Text>
          </View>
          <View style={styles.iconButton}>
            <Feather name="download" size={16} color={palette.textSecondary} />
          </View>
        </View>

        <View style={styles.barChart}>
          {weekBars.map((item, index) => (
            <View key={weekLabels[index]} style={styles.barGroup}>
              <View style={[styles.barSegment, { height: item.top, backgroundColor: palette.accentBlue }]} />
              <View style={[styles.barSegment, { height: item.bottom, backgroundColor: palette.accentGreen }]} />
              <Text style={styles.barLabel}>{weekLabels[index]}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Body Fat</Text>
      <View style={[styles.card, styles.bodyCard]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.metricValue}>-1 kg</Text>
            <Text style={styles.metricLabel}>In this week</Text>
          </View>
          <View style={styles.iconButton}>
            <Feather name="download" size={16} color={palette.textSecondary} />
          </View>
        </View>

        <View style={styles.lineChart}>
          <View style={styles.lineTrack} />
          <View style={styles.lineWave} />
          <View style={styles.lineDot} />
          <View style={styles.lineBadge}>
            <Text style={styles.lineBadgeText}>83 Kg</Text>
          </View>
        </View>

        <View style={styles.weekRow}>
          {weekLabels.map((label) => (
            <Text key={label} style={styles.weekLabel}>
              {label}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.cta}>
        <Feather name="star" size={16} color="#FFFFFF" />
        <Text style={styles.ctaText}>Start analytic with AI</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  headerSpacer: {
    width: 36,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#EFEFF2',
    borderRadius: 999,
    padding: 4,
    justifyContent: 'space-between',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  segmentActive: {
    backgroundColor: palette.surface,
  },
  segmentText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  segmentTextActive: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    gap: 16,
  },
  bodyCard: {
    backgroundColor: '#F4F2FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricGroup: {
    gap: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  metricLabel: {
    fontSize: 11,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  iconButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barGroup: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  barSegment: {
    width: 18,
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 10,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  lineChart: {
    height: 140,
    justifyContent: 'center',
  },
  lineTrack: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#D9D4F7',
    opacity: 0.4,
  },
  lineWave: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderColor: palette.accentPurple,
    borderWidth: 2,
    borderBottomWidth: 0,
    opacity: 0.6,
  },
  lineDot: {
    position: 'absolute',
    top: 52,
    left: '45%',
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: palette.accentPurple,
  },
  lineBadge: {
    position: 'absolute',
    top: 24,
    left: '38%',
    backgroundColor: palette.accentPurple,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lineBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekLabel: {
    fontSize: 10,
    color: palette.textTertiary,
    fontFamily: Fonts.rounded,
  },
  cta: {
    marginTop: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },
});
