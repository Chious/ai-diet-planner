import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const DATABASE_NAME = 'Food-Composition-Database.db';

export const expoDb = openDatabaseSync(DATABASE_NAME);

export const db = drizzle(expoDb);