import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

const palette = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  accentGreen: '#9ED6A5',
};

const tabConfig: Record<
  string,
  { label: string; icon: keyof typeof Feather.glyphMap; isCenter?: boolean; isScan?: boolean }
> = {
  index: { label: 'Home', icon: 'home' },
  tracker: { label: 'Tracker', icon: 'bar-chart-2' },
  create: { label: '', icon: 'plus', isCenter: true },
  scan: { label: 'Scan', icon: 'camera', isScan: true },
  habits: { label: 'Habbits', icon: 'heart' },
  settings: { label: 'Settings', icon: 'settings' },
};

export function RoundedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const createRoute = state.routes.find((route) => route.name === 'create');
  const scanRoute = state.routes.find((route) => route.name === 'scan');
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const isCreateFocused = createRoute && state.index === state.routes.indexOf(createRoute);
  const isScanFocused = scanRoute && state.index === state.routes.indexOf(scanRoute);

  return (
    <View style={styles.container}>
      {showCreateSheet ? (
        <Pressable style={styles.sheetOverlay} onPress={() => setShowCreateSheet(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetTitle}>Pick a meal</Text>
            {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Custom'].map((item) => (
              <Pressable
                key={item}
                style={styles.sheetItem}
                onPress={() => {
                  setShowCreateSheet(false);
                  navigation.navigate('create');
                }}>
                <Text style={styles.sheetItemText}>{item}</Text>
                <Feather name="chevron-right" size={18} color={palette.textSecondary} />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      ) : null}

      {/* Upper Row: Create & Scan */}
      <View style={styles.upperRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={isCreateFocused ? { selected: true } : {}}
          onPress={() => setShowCreateSheet(true)}
          style={styles.upperButton}>
          <View style={styles.upperButtonInner}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={isScanFocused ? { selected: true } : {}}
          onPress={() => navigation.navigate('scan')}
          style={styles.upperButton}>
          <View style={styles.upperButtonInner}>
            <Feather name="camera" size={20} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>

      {/* Main Nav Bar */}
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const config = tabConfig[route.name];
          if (!config || config.isCenter || config.isScan) {
            return null;
          }

          const isFocused = state.index === index;
          const label = config.label;
          const iconColor = isFocused ? palette.textPrimary : palette.textSecondary;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key]?.options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}>
              <Feather name={config.icon} size={20} color={iconColor} />
              <Text style={[styles.tabLabel, { color: iconColor }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: palette.background,
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
  sheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: -120,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderRadius: 14,
  },
  sheetItemText: {
    fontSize: 14,
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  upperRow: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    right: 24,
    top: -60,
  },
  upperButton: {
    alignItems: 'center',
    gap: 6,
  },
  upperButtonInner: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: palette.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  upperButtonLabel: {
    fontSize: 11,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  pill: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: Fonts.rounded,
    fontWeight: '600',
  },
});
