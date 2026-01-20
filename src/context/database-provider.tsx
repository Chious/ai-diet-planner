import migrations from "@/drizzle/migrations";
import * as schema from '@/src/db/schema';
import { drizzle, ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { SQLiteDatabase, SQLiteProvider, SQLiteProviderAssetSource, useSQLiteContext } from "expo-sqlite";
import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

const Logger = console;
const databaseName = 'Food-Composition-Database.db';

interface DatabaseProviderProps extends PropsWithChildren {
  assetSource?: SQLiteProviderAssetSource;
}

export type Database = ExpoSQLiteDatabase<typeof schema>;

const DrizzleContext = createContext<Database | null>(null);


export function useDrizzle(): Database {
   const context = useContext(DrizzleContext);

   if(!context){
      throw new Error('useDrizzle must be used within a DrizzleProvider')
   }

   return context;
}

function DrizzleProvider({ children }: PropsWithChildren) {
   const sqliteDb = useSQLiteContext();
   
   // Enable Drizzle Studio in development
   useDrizzleStudio(sqliteDb);
   
   const db = useMemo(() => {
     Logger.info('Creating Drizzle instance');
     return drizzle(sqliteDb, { schema });
   }, [sqliteDb]);
 
   return (
     <DrizzleContext.Provider value={db}>
       {children}
     </DrizzleContext.Provider>
   );
 }
 
 async function migrateAsync(db: SQLiteDatabase) {
   const drizzleDb = drizzle(db);
   await migrate(drizzleDb, migrations);
 }
 
const options = { enableChangeListener: true };
 
export function DatabaseProvider({ children, assetSource }: DatabaseProviderProps) {
  return (
    <SQLiteProvider
      databaseName={databaseName}
      assetSource={assetSource}
      onInit={migrateAsync}
      options={options}
      useSuspense
    >
      <DrizzleProvider>
        {children}
      </DrizzleProvider>
    </SQLiteProvider>
  );
}