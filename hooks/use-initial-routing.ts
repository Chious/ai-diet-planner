import { getUserProfileById, seedTestUser } from '@/src/db';
import * as schema from '@/src/db/schema';
import { getUserId } from '@/src/utils/userIdManager';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { router, useSegments } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';

// TODO: Remove Seed Logic in production

/**
 * Handle initial routing logic on app startup.
 * - Seeds test user in development
 * - Redirects to onboarding if no user profile exists
 * - Returns loading state while checking
 */
export function useInitialRouting() {
  const db = useSQLiteContext();
  const segments = useSegments();
  const [isChecking, setIsChecking] = useState(true);

  const drizzleDb = useMemo(() => drizzle(db, { schema }), [db]);

  useEffect(() => {
    let isMounted = true;

    async function checkAndRoute() {
      try {
        // Seed test user for development (only runs once)
        let wasNewUserCreated = false;
        if (__DEV__) {
          wasNewUserCreated = await seedTestUser(drizzleDb);
        }

        // Skip check if already on onboarding route
        const isOnboardingRoute = segments[0] === 'onboarding';
        if (isOnboardingRoute) {
          if (isMounted) setIsChecking(false);
          return;
        }

        // Check if user profile exists
        const userId = await getUserId();
        const profile = await getUserProfileById(drizzleDb, userId);

        if (!profile) {
          // No profile - redirect to onboarding
          router.replace('/onboarding');
        } else if (wasNewUserCreated) {
          // First time seed - redirect to dashboard
          console.log('🏠 First time seed complete, redirecting to dashboard...');
          router.replace('/(tabs)');
        }

        if (isMounted) setIsChecking(false);
      } catch (error) {
        console.error('Error during initial routing check:', error);
        if (isMounted) setIsChecking(false);
      }
    }

    checkAndRoute();

    return () => {
      isMounted = false;
    };
  }, [drizzleDb, segments]);

  return { isChecking };
}
