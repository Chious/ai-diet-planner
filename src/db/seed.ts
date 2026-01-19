import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { createNutritionPlanForUser } from '../services/nutritionPlanService';
import { upsertUserProfile } from './queries';
import * as schema from './schema';

const TEST_USER_ID = 'dev-test-user';
const USER_ID_KEY = '@diet_planner_user_id';

/**
 * Seed database with test user data for development
 * Only runs if no user profile exists
 * @returns {Promise<boolean>} true if a new user was created, false if user already existed
 */
export async function seedTestUser(db: ExpoSQLiteDatabase<typeof schema>): Promise<boolean> {
  try {
    console.log('🌱 Checking for test user data...');
    
    // Check if any user exists
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, TEST_USER_ID));
    
    if (existingUser) {
      console.log('✅ Test user already exists, skipping seed');
      // Set AsyncStorage to use this test user
      await AsyncStorage.setItem(USER_ID_KEY, TEST_USER_ID);
      return false; // User already existed
    }
    
    // Create test user
    const now = new Date().toISOString();
    const testUser: schema.NewUser = {
      id: TEST_USER_ID,
      age: 28,
      gender: 'male',
      heightCm: 175,
      weightKg: 70,
      activityLevel: 1.55, // Moderate activity (3-5 days/week)
      goal: 'maintain',
      targetWeightKg: 70,
      dietaryRestrictions: '[]',
      createdAt: now,
      updatedAt: now,
    };
    
    await upsertUserProfile(db, testUser);
    
    // Create nutrition plan for test user
    try {
      await createNutritionPlanForUser({
        db,
        userId: TEST_USER_ID,
        makeActive: true,
      });
      console.log('✅ Test nutrition plan created');
    } catch (planError) {
      console.warn('⚠️ Failed to create test nutrition plan:', planError);
    }
    
    // Set AsyncStorage to use this test user
    await AsyncStorage.setItem(USER_ID_KEY, TEST_USER_ID);
    
    console.log('✅ Test user seeded successfully:', TEST_USER_ID);
    console.log('📊 Profile:', {
      age: testUser.age,
      gender: testUser.gender,
      height: `${testUser.heightCm}cm`,
      weight: `${testUser.weightKg}kg`,
      goal: testUser.goal,
      activityLevel: testUser.activityLevel,
    });
    
    return true; // New user was created
    
  } catch (error) {
    console.error('❌ Failed to seed test user:', error);
    return false;
  }
}

/**
 * Clear test user data (for development reset)
 */
export async function clearTestUser(db: ExpoSQLiteDatabase<typeof schema>) {
  try {
    console.log('🧹 Clearing test user data...');
    
    // Remove from database
    await db.delete(schema.users).where(eq(schema.users.id, TEST_USER_ID));
    
    // Clear AsyncStorage
    await AsyncStorage.removeItem(USER_ID_KEY);
    
    console.log('✅ Test user cleared');
  } catch (error) {
    console.error('❌ Failed to clear test user:', error);
  }
}
