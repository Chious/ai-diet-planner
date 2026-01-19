import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { analyzeFoodImage } from '@/src/services/gemini';

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
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockCapture = useMemo(
    () => ({
      base64Image:
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8HwQACfsD/Qo1uWAAAAAASUVORK5CYII=',
      mimeType: 'image/png',
    }),
    []
  );

  const handleScan = useCallback(async () => {
    if (isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const autoScan =
        process.env.EXPO_PUBLIC_AUTO_SCAN === 'true' ||
        Boolean((globalThis as { __DETOX_MOCKS__?: { autoScan?: boolean } }).__DETOX_MOCKS__?.autoScan);

      let capture = mockCapture;

      if (!autoScan) {
        if (!permission?.granted) {
          await requestPermission();
          throw new Error('Camera permission is required to scan food.');
        }

        if (!cameraRef.current) {
          throw new Error('Camera is not ready.');
        }

        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });

        if (!photo.base64) {
          throw new Error('Failed to capture image.');
        }

        capture = {
          base64Image: photo.base64,
          mimeType: 'image/jpeg',
        };
      }

      const result = await analyzeFoodImage(capture);
      router.push({
        pathname: '/scan-review' as never,
        params: {
          name: result.name,
          calories: String(result.calories),
          protein: String(result.macros.protein),
          carbs: String(result.macros.carbs),
          fats: String(result.macros.fats),
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze image.';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, mockCapture, permission?.granted, requestPermission]);

  useEffect(() => {
    const autoScan =
      process.env.EXPO_PUBLIC_AUTO_SCAN === 'true' ||
      Boolean((globalThis as { __DETOX_MOCKS__?: { autoScan?: boolean } }).__DETOX_MOCKS__?.autoScan);

    if (autoScan) {
      handleScan();
    }
  }, [handleScan]);

  return (
    <View style={styles.screen}>
      {permission?.granted ? (
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}
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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!permission?.granted ? (
            <Pressable
              accessibilityRole="button"
              style={styles.permissionButton}
              onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Enable Camera</Text>
            </Pressable>
          ) : null}

          <View style={styles.actionRow}>
            <View style={styles.actionIcon}>
              <Feather name="image" size={18} color={palette.accentBlue} />
            </View>
            <Pressable
              accessibilityRole="button"
              testID="scan-capture-button"
              style={styles.scanButton}
              onPress={handleScan}>
              {isAnalyzing ? (
                <ActivityIndicator size="small" color={palette.accentBlue} />
              ) : (
                <Feather name="maximize" size={22} color={palette.accentBlue} />
              )}
            </Pressable>
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
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1C1C1E',
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
  errorText: {
    fontSize: 12,
    color: '#D14343',
    fontFamily: Fonts.rounded,
  },
  permissionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#1C1C1E',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  permissionButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
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
