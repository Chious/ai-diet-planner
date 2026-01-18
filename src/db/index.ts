import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("Food-Composition-Database.db", {
  enableChangeListener: true,
});

export const db = drizzle(expoDb, { schema });
export * from "./schema";
export * from "./queries";
