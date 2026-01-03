import { z } from 'zod';

// Schema for streak data
export const streakDataSchema = z.object({
  currentStreak: z.number().min(0).default(0),
  longestStreak: z.number().min(0).default(0),
  totalSessions: z.number().min(0).default(0),
  plantLevel: z.number().min(0).default(0),
  causesHelped: z.number().min(0).default(0),
});

export type StreakData = z.infer<typeof streakDataSchema>;

export const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  totalSessions: 0,
  plantLevel: 0,
  causesHelped: 0,
};

/**
 * Safely parse JSON from localStorage with validation
 * Returns fallback value if parsing fails or data doesn't match schema
 */
export function safeParseLocalStorage<T>(
  key: string,
  schema: z.ZodSchema<T>,
  fallback: T
): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      return fallback;
    }
    const parsed = JSON.parse(saved);
    const validated = schema.parse(parsed);
    return validated;
  } catch (error) {
    console.warn(`Invalid localStorage data for key "${key}", using defaults`);
    return fallback;
  }
}

/**
 * Get streak data from localStorage with safe parsing
 */
export function getStreakData(): StreakData {
  return safeParseLocalStorage('myspace-streak', streakDataSchema, defaultStreakData);
}

/**
 * Save streak data to localStorage
 */
export function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem('myspace-streak', JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save streak data to localStorage');
  }
}
