import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = '@diet_planner_user_id';

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `user_${timestamp}_${random}`;
}

/**
 * Get or create a unique user ID
 * This will generate a new ID on first app launch and persist it
 */
export async function getUserId(): Promise<string> {
  try {
    // Try to get existing user ID
    const existingId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (existingId) {
      return existingId;
    }
    
    // Generate new user ID if none exists
    const newId = generateUserId();
    await AsyncStorage.setItem(USER_ID_KEY, newId);
    console.log('✅ Generated new user ID:', newId);
    
    return newId;
  } catch (error) {
    console.error('❌ Error managing user ID:', error);
    // Fallback to a session-only ID if storage fails
    return generateUserId();
  }
}

/**
 * Clear the stored user ID (useful for logout or reset)
 */
export async function clearUserId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    console.log('✅ User ID cleared');
  } catch (error) {
    console.error('❌ Error clearing user ID:', error);
  }
}

/**
 * Check if a user ID exists
 */
export async function hasUserId(): Promise<boolean> {
  try {
    const id = await AsyncStorage.getItem(USER_ID_KEY);
    return id !== null;
  } catch (error) {
    console.error('❌ Error checking user ID:', error);
    return false;
  }
}
