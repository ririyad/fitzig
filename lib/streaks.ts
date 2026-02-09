import { SessionRun } from '@/types/workout';

/**
 * Streak calculation utilities
 * Uses 48-hour grace period for beginner-friendly streaks
 */

// 48 hours in milliseconds (beginner-friendly grace period)
export const STREAK_GRACE_PERIOD_MS = 48 * 60 * 60 * 1000;

/**
 * Get unique workout dates from runs, normalized to YYYY-MM-DD format
 */
export function getUniqueWorkoutDates(runs: SessionRun[]): string[] {
  const dateSet = new Set<string>();
  runs.forEach((run) => {
    const date = new Date(run.completedAt);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dateSet.add(dateKey);
  });
  return Array.from(dateSet).sort();
}

/**
 * Check if two timestamps are on the same day
 */
export function isSameDay(timestamp1: number, timestamp2: number): boolean {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a timestamp represents yesterday relative to now
 */
export function isYesterday(timestamp: number, now: number = Date.now()): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(timestamp);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

/**
 * Check if the user has worked out today
 */
export function hasWorkedOutToday(runs: SessionRun[], now: number = Date.now()): boolean {
  if (runs.length === 0) return false;
  const mostRecentRun = runs[0]; // Runs are sorted by completedAt desc
  return isSameDay(mostRecentRun.completedAt, now);
}

/**
 * Get the timestamp of the last workout
 */
export function getLastWorkoutTimestamp(runs: SessionRun[]): number | null {
  if (runs.length === 0) return null;
  return runs[0].completedAt;
}

/**
 * Calculate current streak
 * Uses 48-hour grace period (allows missing one day)
 */
export function calculateCurrentStreak(runs: SessionRun[], now: number = Date.now()): number {
  if (runs.length === 0) return 0;

  const uniqueDates = getUniqueWorkoutDates(runs);
  if (uniqueDates.length === 0) return 0;

  const mostRecentDate = uniqueDates[uniqueDates.length - 1];
  const mostRecentDateObj = new Date(mostRecentDate);
  const mostRecentTimestamp = mostRecentDateObj.getTime();

  // Check if streak is still valid (worked out today or within grace period)
  const timeSinceLastWorkout = now - mostRecentTimestamp;
  
  // If more than 48 hours since last workout, streak is broken
  if (timeSinceLastWorkout > STREAK_GRACE_PERIOD_MS) {
    return 0;
  }

  // Calculate streak by counting consecutive days backwards
  let streak = 1;
  
  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    const currentDate = new Date(uniqueDates[i + 1]);
    const previousDate = new Date(uniqueDates[i]);
    
    // Check if dates are consecutive (1 day apart)
    const diffTime = currentDate.getTime() - previousDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays === 2) {
      // 1 day gap is allowed (grace period), but streak doesn't increase
      // Only continue if this is not the most recent gap
      const timeFromPreviousToNow = now - previousDate.getTime();
      if (timeFromPreviousToNow <= STREAK_GRACE_PERIOD_MS) {
        streak++;
      } else {
        break;
      }
    } else {
      // Gap of 2+ days breaks the streak
      break;
    }
  }

  return streak;
}

/**
 * Calculate longest streak ever achieved
 */
export function calculateLongestStreak(runs: SessionRun[]): number {
  if (runs.length === 0) return 0;

  const uniqueDates = getUniqueWorkoutDates(runs);
  if (uniqueDates.length === 0) return 0;
  if (uniqueDates.length === 1) return 1;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const previousDate = new Date(uniqueDates[i - 1]);
    
    const diffTime = currentDate.getTime() - previousDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays === 2) {
      // One day gap - streak continues but doesn't count as consecutive
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      // Gap of 2+ days - streak breaks
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * Get full streak information
 */
export function getStreakInfo(runs: SessionRun[], now: number = Date.now()) {
  const currentStreak = calculateCurrentStreak(runs, now);
  const longestStreak = calculateLongestStreak(runs);
  const workedOutToday = hasWorkedOutToday(runs, now);
  const lastWorkoutTimestamp = getLastWorkoutTimestamp(runs);

  return {
    current: currentStreak,
    longest: longestStreak,
    workedOutToday,
    lastWorkoutTimestamp,
  };
}

/**
 * Get motivational message based on streak
 */
export function getStreakMessage(streak: number, workedOutToday: boolean): string {
  if (streak === 0) {
    return "Start your streak today!";
  }
  
  if (workedOutToday) {
    if (streak === 1) return "First day done! Keep it going!";
    if (streak === 2) return "2 days in a row! Building momentum!";
    if (streak === 3) return "3-day streak! You're on fire!";
    if (streak === 5) return "5 days strong! Amazing consistency!";
    if (streak === 7) return "Week complete! You're unstoppable!";
    if (streak === 14) return "2 week streak! Incredible dedication!";
    if (streak === 21) return "3 week streak! You're a machine!";
    if (streak === 30) return "Month-long streak! Legendary!";
    return `${streak} day streak! Keep crushing it!`;
  } else {
    if (streak === 1) return "Don't break the chain!";
    if (streak === 2) return "Keep your streak alive!";
    return `${streak} day streak at risk! Work out today!`;
  }
}
