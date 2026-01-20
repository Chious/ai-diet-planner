import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useDrizzle } from "@/src/context/database-provider";
import { createMealLog } from "@/src/db/queries";
import { getUserId } from "@/src/utils/userIdManager";

const palette = {
  background: "#F5F5F7",
  surface: "#FFFFFF",
  textPrimary: "#1C1C1E",
  textSecondary: "#6C6C70",
  accentBlue: "#53A6D9",
  accentGreen: "#9ED6A5",
};

function formatDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ScanReviewScreen() {
  const db = useDrizzle();
  const params = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const analysis = useMemo(() => {
    const calories = Number(params.calories ?? 0);
    const protein = Number(params.protein ?? 0);
    const carbs = Number(params.carbs ?? 0);
    const fats = Number(params.fats ?? 0);

    return {
      name: String(params.name ?? "Unknown Dish"),
      calories: Number.isFinite(calories) ? calories : 0,
      macros: {
        protein: Number.isFinite(protein) ? protein : 0,
        carbs: Number.isFinite(carbs) ? carbs : 0,
        fats: Number.isFinite(fats) ? fats : 0,
      },
    };
  }, [params]);

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const userId = await getUserId();
      const now = new Date();

      await createMealLog(db, {
        id: createId("meal"),
        userId,
        date: formatDate(now),
        mealType: "lunch",
        items: JSON.stringify([
          {
            name: analysis.name,
            calories: analysis.calories,
            macros: analysis.macros,
          },
        ]),
        notes: "Logged via AI scan",
        createdAt: now.toISOString(),
      });

      router.replace("/(tabs)");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: "Review Meal" }} />
      <View style={styles.card}>
        <Text style={styles.title} testID="review-food-name">
          {analysis.name}
        </Text>
        <Text style={styles.calories}>{analysis.calories} kcal</Text>

        <View style={styles.macroRow}>
          <View style={styles.macroChip}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{analysis.macros.protein}g</Text>
          </View>
          <View style={styles.macroChip}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{analysis.macros.carbs}g</Text>
          </View>
          <View style={styles.macroChip}>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={styles.macroValue}>{analysis.macros.fats}g</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          testID="save-meal-button"
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Meal</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 20,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  calories: {
    fontSize: 22,
    fontWeight: "700",
    color: palette.accentGreen,
    fontFamily: Fonts.rounded,
  },
  macroRow: {
    flexDirection: "row",
    gap: 10,
  },
  macroChip: {
    flex: 1,
    backgroundColor: "#EEF1F4",
    borderRadius: 14,
    padding: 10,
    gap: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: Fonts.rounded,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.textPrimary,
    fontFamily: Fonts.rounded,
  },
  saveButton: {
    backgroundColor: palette.accentBlue,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: Fonts.rounded,
  },
});
