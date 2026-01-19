import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';
import * as schema from './schema';

/**
 * Hook to get the Drizzle database instance from SQLite context
 * This must be used within a component that's wrapped by SQLiteProvider
 */
export function useDatabase() {
  const db = useSQLiteContext();
  return useMemo(() => drizzle(db, { schema }), [db]);
}