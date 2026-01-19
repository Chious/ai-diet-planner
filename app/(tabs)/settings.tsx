import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  softPeach: '#FFE6E1',
};

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage notifications and preferences.</Text>
      </View>
      <Pressable style={styles.actionCard} onPress={() => router.push('/onboarding')}>
        <Text style={styles.actionTitle}>Profile & Onboarding</Text>
        <Text style={styles.actionSubtitle}>Set up or edit your nutrition profile.</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 24,
  },
  card: {
    backgroundColor: palette.softPeach,
    borderRadius: 20,
    padding: 18,
  },
  actionCard: {
    marginTop: 16,
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Fonts.rounded,
    color: palette.textPrimary,
  },
  actionSubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: Fonts.rounded,
    color: palette.textSecondary,
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
});
