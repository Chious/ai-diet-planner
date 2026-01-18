import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF1F4',
  divider: '#E6E6EB',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  accentBlue: '#53A6D9',
  accentOrange: '#F08B2C',
};

export default function ScanScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Feather name="x" size={18} color={palette.textPrimary} />
        </View>
        <View style={styles.iconCircle}>
          <Feather name="zap-off" size={18} color={palette.textPrimary} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.remainingText}>Remaining Scans: 0</Text>
          <View style={styles.premiumButton}>
            <Text style={styles.premiumText}>Go Premium</Text>
          </View>
        </View>

        <View style={styles.segmented}>
          {['Meal', 'Barcode', 'Label', 'Menu'].map((label) => {
            const isActive = label === 'Meal';
            return (
              <View key={label} style={[styles.segment, isActive && styles.segmentActive]}>
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.panel}>
          <View style={styles.toggleRow}>
            <View style={[styles.toggle, styles.toggleActive]}>
              <Text style={styles.toggleTextActive}>Photo</Text>
            </View>
            <View style={styles.toggle}>
              <Text style={styles.toggleText}>Photo &amp; Hint</Text>
            </View>
          </View>

          <Text style={styles.panelText}>
            Snap a photo, AI Meal Scan will log your meal in seconds
          </Text>

          <View style={styles.actionRow}>
            <View style={styles.actionIcon}>
              <Feather name="image" size={18} color={palette.accentBlue} />
            </View>
            <View style={styles.scanButton}>
              <Feather name="maximize" size={22} color={palette.accentBlue} />
            </View>
            <View style={styles.actionIcon}>
              <Feather name="help-circle" size={18} color={palette.accentBlue} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  iconCircle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remainingText: {
    fontSize: 14,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  premiumButton: {
    backgroundColor: palette.accentOrange,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  premiumText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Fonts.rounded,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: 999,
    padding: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  segmentActive: {
    backgroundColor: '#CFE2F5',
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
  panel: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    padding: 4,
  },
  toggle: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999,
  },
  toggleActive: {
    backgroundColor: '#CFE2F5',
  },
  toggleText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  toggleTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  panelText: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  actionIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: palette.accentBlue,
    backgroundColor: '#FFFFFF',
  },
});
