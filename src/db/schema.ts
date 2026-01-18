import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const foods = sqliteTable(
  "foods",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    brand: text("brand"),
    barcode: text("barcode"),
    imageUrl: text("image_url"),
    source: text("source", { enum: ["off", "tw_fda", "custom"] }).notNull(),
    servingSize: real("serving_size").default(100),
    servingUnit: text("serving_unit").default("g"),
    baseWeightG: real("base_weight_g").default(100),
    calories: real("calories"),
    protein: real("protein"),
    carbs: real("carbs"),
    fats: real("fats"),
    fiber: real("fiber"),
    sugar: real("sugar"),
    sodium: real("sodium"),
    potassium: real("potassium"),
    calcium: real("calcium"),
    magnesium: real("magnesium"),
    iron: real("iron"),
    zinc: real("zinc"),
    phosphorus: real("phosphorus"),
    copper: real("copper"),
    manganese: real("manganese"),
    vitaminAIu: real("vitamin_a_iu"),
    vitaminARe: real("vitamin_a_re"),
    vitaminDIu: real("vitamin_d_iu"),
    vitaminE: real("vitamin_e"),
    vitaminK1: real("vitamin_k1"),
    vitaminB1: real("vitamin_b1"),
    vitaminB2: real("vitamin_b2"),
    niacin: real("niacin"),
    vitaminB6: real("vitamin_b6"),
    vitaminB12: real("vitamin_b12"),
    folate: real("folate"),
    vitaminC: real("vitamin_c"),
  },
  (table) => ({
    foodsNameIdx: index("foods_name_idx").on(table.name),
    foodsBarcodeIdx: index("foods_barcode_idx").on(table.barcode),
  })
);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  age: real("age"),
  gender: text("gender", { enum: ["male", "female", "other"] }),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  activityLevel: real("activity_level"),
  goal: text("goal", { enum: ["lose", "maintain", "gain"] }),
  targetWeightKg: real("target_weight_kg"),
  dietaryRestrictions: text("dietary_restrictions"), // JSON array string
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const diary = sqliteTable(
  "diary",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    mealType: text("meal_type", {
      enum: ["breakfast", "lunch", "dinner", "snack"],
    }).notNull(),
    items: text("items").notNull(), // JSON array string
    notes: text("notes"),
    createdAt: text("created_at"),
  },
  (table) => ({
    diaryUserIdIdx: index("diary_user_id_idx").on(table.userId),
    diaryDateIdx: index("diary_date_idx").on(table.date),
  })
);

export const nutritionPlans = sqliteTable(
  "nutrition_plans",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    dailyCalories: real("daily_calories").notNull(),
    proteinGrams: real("protein_grams").notNull(),
    carbsGrams: real("carbs_grams").notNull(),
    fatsGrams: real("fats_grams").notNull(),
    customRatios: text("custom_ratios"), // JSON object string
    startDate: text("start_date").notNull(), // YYYY-MM-DD
    isActive: integer("is_active", { mode: "boolean" }).default(false).notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    nutritionPlansUserIdIdx: index("nutrition_plans_user_id_idx").on(table.userId),
    nutritionPlansActiveIdx: index("nutrition_plans_active_idx").on(table.isActive),
  })
);

export const mealLogs = sqliteTable(
  "meal_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    mealType: text("meal_type", {
      enum: ["breakfast", "lunch", "dinner", "snack"],
    }).notNull(),
    items: text("items").notNull(), // JSON array string
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    mealLogsUserIdIdx: index("meal_logs_user_id_idx").on(table.userId),
    mealLogsDateIdx: index("meal_logs_date_idx").on(table.date),
  })
);

export const recipes = sqliteTable(
  "recipes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    servings: real("servings").notNull(),
    ingredients: text("ingredients").notNull(), // JSON array string
    instructions: text("instructions"),
    tags: text("tags"), // JSON array string
    nutritionPerServing: text("nutrition_per_serving"), // JSON object string
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    recipesUserIdIdx: index("recipes_user_id_idx").on(table.userId),
    recipesNameIdx: index("recipes_name_idx").on(table.name),
  })
);

export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DiaryEntry = typeof diary.$inferSelect;
export type NewDiaryEntry = typeof diary.$inferInsert;
export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type NewNutritionPlan = typeof nutritionPlans.$inferInsert;
export type MealLog = typeof mealLogs.$inferSelect;
export type NewMealLog = typeof mealLogs.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
