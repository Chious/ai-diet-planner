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
  const scanRoute = state.routes.find((route) => route.name === 'scan');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
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
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const config = tabConfig[route.name];
          if (!config) {
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

          if (config.isCenter) {
            const isScanFocused =
              scanRoute != null && state.index === state.routes.indexOf(scanRoute);
            return (
              <View key={route.key} style={styles.centerGroup}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={() => setShowCreateSheet(true)}
                  style={styles.centerWrap}>
                  <View style={styles.centerButton}>
                    <Feather name={config.icon} size={22} color="#FFFFFF" />
                  </View>
                </Pressable>
                {scanRoute ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={isScanFocused ? { selected: true } : {}}
                    accessibilityLabel={descriptors[scanRoute.key]?.options.tabBarAccessibilityLabel}
                    onPress={() => navigation.navigate(scanRoute.name)}
                    style={styles.centerTabItem}>
                    <Feather
                      name="camera"
                      size={20}
                      color={isScanFocused ? palette.textPrimary : palette.textSecondary}
                    />
                  </Pressable>
                ) : null}
              </View>
            );
          }

          if (config.isScan) {
            return null;
          }

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
    backgroundColor: palette.background,
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
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
  centerWrap: {
    marginTop: -24,
  },
  centerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: -12,
  },
  centerTabItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 56,
  },
  centerButton: {
    height: 54,
    width: 54,
    borderRadius: 27,
    backgroundColor: palette.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
});
