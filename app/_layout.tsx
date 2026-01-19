import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';
import { router, Stack, useSegments } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUserProfileById, seedTestUser } from '@/src/db';
import * as schema from '@/src/db/schema';
import { applyDetoxMocks } from '@/src/testing/detoxMocks';
import { getUserId } from '@/src/utils/userIdManager';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import migrations from '../drizzle/migrations';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  applyDetoxMocks();

  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName="Food-Composition-Database.db"
        assetSource={{ assetId: require('./assets/Food-Composition-Database.db'), forceOverwrite: true }}
        useSuspense
        
        
      >
        <MigrationHandler>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
           <RootLayoutContent />
          </ThemeProvider>
        </MigrationHandler>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutContent() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </>
  );
}
function MigrationHandler({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const segments = useSegments();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);
  
  useDrizzleStudio(db);

  const { success, error } = useMigrations(drizzleDb, migrations);

  useEffect(() => {
    let isMounted = true;
    async function checkUserProfile() {
      if (!success) {
        return;
      }

      // Seed test user for development (only runs once)
      let wasNewUserCreated = false;
      if (__DEV__) {
        wasNewUserCreated = await seedTestUser(drizzleDb);
      }

      const isOnboardingRoute = segments[0] === 'onboarding';
      if (isOnboardingRoute) {
        if (isMounted) setIsCheckingProfile(false);
        return;
      }

      const userId = await getUserId();
      const profile = await getUserProfileById(drizzleDb, userId);

      if (!profile) {
        router.replace('/onboarding');
      } else if (wasNewUserCreated) {
        // First time seed - redirect to dashboard
        console.log('🏠 First time seed complete, redirecting to dashboard...');
        router.replace('/(tabs)');
      }

      if (isMounted) setIsCheckingProfile(false);
    }

    checkUserProfile();
    return () => {
      isMounted = false;
    };
  }, [drizzleDb, segments, success]);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isCheckingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}