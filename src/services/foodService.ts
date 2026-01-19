import { like } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

import * as schema from '../db/schema';
import { foods } from '../db/schema';

type Database = ExpoSQLiteDatabase<typeof schema>;

export async function searchFoodsByName(db: Database, query: string, limit = 20) {
  if (!query.trim()) {
    return [];
  }

  return db
    .select()
    .from(foods)
    .where(like(foods.name, `%${query}%`))
    .limit(limit);
}
