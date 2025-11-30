/**
 * ProfileManager.ts
 *
 * Manages multiple user profiles with localStorage persistence.
 * Each profile maintains separate stats, level, and progress.
 * Extended to support adaptive sequencing with new LearnerProfile fields.
 */

import { Profile, ProfilesData, ProfileStats, ProfileLevelingState, Category, ProgressionStage } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'reading-hero-profiles';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for a profile
 */
function generateId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial empty stats
 */
function createEmptyStats(): ProfileStats {
  return {
    accuracy: 0,
    wordsCompleted: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    totalKeystrokes: 0,
  };
}

/**
 * Create initial leveling state
 */
function createInitialLevelingState(): ProfileLevelingState {
  return {
    currentLevel: 1,
    wordHistory: [],
    levelStartWordCount: 0,
    uniqueWordsCompleted: [],
  };
}

/**
 * Create default category affinity map (all categories at 50)
 */
function createDefaultCategoryAffinity(): Record<Category, number> {
  return {
    animals: 50,
    food: 50,
    fantasy: 50,
    tech: 50,
    nature: 50,
    actions: 50,
    feelings: 50,
    places: 50,
    activities: 50,
    nowWords: 50,
  };
}

/**
 * Create default motor metrics
 */
function createDefaultMotorMetrics() {
  return {
    leftHandErrors: 0,
    rightHandErrors: 0,
    rowTransitionSpeed: 0,
    commonLetterErrors: {},
  };
}

/**
 * Create default spaced repetition bins
 */
function createDefaultSpacedRepetition() {
  return {
    A: [],
    B: [],
    C: [],
  };
}

/**
 * Migrate an old profile to include new adaptive sequencing fields.
 * This ensures backward compatibility with existing profiles.
 */
function migrateProfile(oldProfile: any): Profile {
  // Start with the old profile data
  const migratedProfile: any = { ...oldProfile };

  // Add new fields if they don't exist
  if (migratedProfile.progressionState === undefined) {
    migratedProfile.progressionState = 1 as ProgressionStage;
  }

  if (migratedProfile.engagementScore === undefined) {
    migratedProfile.engagementScore = 50;
  }

  if (migratedProfile.typingSpeedBaseline === undefined) {
    migratedProfile.typingSpeedBaseline = 1000; // 1 second per letter
  }

  if (migratedProfile.errorBaseline === undefined) {
    migratedProfile.errorBaseline = 2;
  }

  if (migratedProfile.categoryAffinity === undefined) {
    migratedProfile.categoryAffinity = createDefaultCategoryAffinity();
  }

  if (migratedProfile.motor === undefined) {
    migratedProfile.motor = createDefaultMotorMetrics();
  }

  if (migratedProfile.spacedRepetition === undefined) {
    migratedProfile.spacedRepetition = createDefaultSpacedRepetition();
  }

  if (migratedProfile.lastTenItems === undefined) {
    migratedProfile.lastTenItems = [];
  }

  if (migratedProfile.totalCompleted === undefined) {
    migratedProfile.totalCompleted = 0;
  }

  return migratedProfile as Profile;
}

/**
 * Load profiles data from localStorage
 * Automatically migrates old profiles to include new adaptive sequencing fields
 */
function loadProfilesData(): ProfilesData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        profiles: [],
        activeProfileId: null,
      };
    }

    const parsed = JSON.parse(stored) as ProfilesData;

    // Migrate all profiles to ensure they have the new fields
    const migratedProfiles = (parsed.profiles || []).map(profile => migrateProfile(profile));

    // Check if any profiles were migrated (have new fields added)
    const needsSave = migratedProfiles.some((migrated, index) => {
      const original = parsed.profiles[index];
      return original && (
        original.progressionState === undefined ||
        original.engagementScore === undefined ||
        original.categoryAffinity === undefined ||
        original.motor === undefined ||
        original.spacedRepetition === undefined ||
        original.lastTenItems === undefined ||
        original.totalCompleted === undefined
      );
    });

    const result = {
      profiles: migratedProfiles,
      activeProfileId: parsed.activeProfileId || null,
    };

    // Save back if migration occurred
    if (needsSave && migratedProfiles.length > 0) {
      saveProfilesData(result);
    }

    return result;
  } catch (error) {
    console.error('Failed to load profiles data:', error);
    return {
      profiles: [],
      activeProfileId: null,
    };
  }
}

/**
 * Save profiles data to localStorage
 */
function saveProfilesData(data: ProfilesData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save profiles data:', error);
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get all profiles
 */
export function getProfiles(): Profile[] {
  const data = loadProfilesData();
  return data.profiles;
}

/**
 * Create a new profile
 *
 * @param params - Profile creation parameters
 * @param params.name - Display name for the profile
 * @param params.avatar - Emoji avatar for the profile
 * @returns The newly created profile
 */
export function createProfile({ name, avatar }: { name: string; avatar: string }): Profile {
  const data = loadProfilesData();

  const newProfile: Profile = {
    id: generateId(),
    name,
    avatar,
    level: 1,
    lastWordId: null,
    stats: createEmptyStats(),
    levelingState: createInitialLevelingState(),
    createdAt: Date.now(),
    updatedAt: Date.now(),

    // Adaptive sequencing fields
    progressionState: 1 as ProgressionStage,
    engagementScore: 50,
    typingSpeedBaseline: 1000, // 1 second per letter
    errorBaseline: 2,
    categoryAffinity: createDefaultCategoryAffinity(),
    motor: createDefaultMotorMetrics(),
    spacedRepetition: createDefaultSpacedRepetition(),
    lastTenItems: [],
    totalCompleted: 0,
  };

  data.profiles.push(newProfile);

  // If this is the first profile, make it active
  if (data.profiles.length === 1) {
    data.activeProfileId = newProfile.id;
  }

  saveProfilesData(data);
  return newProfile;
}

/**
 * Delete a profile by ID
 *
 * @param id - Profile ID to delete
 * @returns true if profile was deleted, false if not found
 */
export function deleteProfile(id: string): boolean {
  const data = loadProfilesData();

  const initialLength = data.profiles.length;
  data.profiles = data.profiles.filter(p => p.id !== id);

  // If nothing was deleted, return false
  if (data.profiles.length === initialLength) {
    return false;
  }

  // If the active profile was deleted, switch to another profile or clear
  if (data.activeProfileId === id) {
    const firstProfile = data.profiles[0];
    data.activeProfileId = firstProfile ? firstProfile.id : null;
  }

  saveProfilesData(data);
  return true;
}

/**
 * Set the active profile by ID
 *
 * @param id - Profile ID to activate
 * @returns true if profile was activated, false if not found
 */
export function setActiveProfile(id: string): boolean {
  const data = loadProfilesData();

  // Check if profile exists
  const profile = data.profiles.find(p => p.id === id);
  if (!profile) {
    return false;
  }

  data.activeProfileId = id;
  saveProfilesData(data);
  return true;
}

/**
 * Get the currently active profile
 *
 * @returns The active profile or null if none is active
 */
export function getActiveProfile(): Profile | null {
  const data = loadProfilesData();

  if (!data.activeProfileId) {
    return null;
  }

  const profile = data.profiles.find(p => p.id === data.activeProfileId);
  return profile || null;
}

/**
 * Update the active profile with new data
 *
 * @param updates - Partial profile data to update
 * @returns The updated profile or null if no active profile
 */
export function updateActiveProfile(updates: Partial<Omit<Profile, 'id' | 'createdAt'>>): Profile | null {
  const data = loadProfilesData();

  if (!data.activeProfileId) {
    return null;
  }

  const profileIndex = data.profiles.findIndex(p => p.id === data.activeProfileId);
  if (profileIndex === -1) {
    return null;
  }

  const currentProfile = data.profiles[profileIndex];
  if (!currentProfile) {
    return null;
  }

  // Update the profile with new data and updatedAt timestamp
  const updatedProfile: Profile = {
    id: currentProfile.id,
    name: updates.name ?? currentProfile.name,
    avatar: updates.avatar ?? currentProfile.avatar,
    level: updates.level ?? currentProfile.level,
    lastWordId: updates.lastWordId !== undefined ? updates.lastWordId : currentProfile.lastWordId,
    stats: updates.stats ?? currentProfile.stats,
    levelingState: updates.levelingState ?? currentProfile.levelingState,
    createdAt: currentProfile.createdAt,
    updatedAt: Date.now(),

    // Adaptive sequencing fields
    progressionState: updates.progressionState ?? currentProfile.progressionState,
    engagementScore: updates.engagementScore ?? currentProfile.engagementScore,
    typingSpeedBaseline: updates.typingSpeedBaseline ?? currentProfile.typingSpeedBaseline,
    errorBaseline: updates.errorBaseline ?? currentProfile.errorBaseline,
    categoryAffinity: updates.categoryAffinity ?? currentProfile.categoryAffinity,
    motor: updates.motor ?? currentProfile.motor,
    spacedRepetition: updates.spacedRepetition ?? currentProfile.spacedRepetition,
    lastTenItems: updates.lastTenItems ?? currentProfile.lastTenItems,
    totalCompleted: updates.totalCompleted ?? currentProfile.totalCompleted,
  };

  data.profiles[profileIndex] = updatedProfile;
  saveProfilesData(data);
  return updatedProfile;
}

/**
 * Get the active profile ID
 *
 * @returns The active profile ID or null if none is active
 */
export function getActiveProfileId(): string | null {
  const data = loadProfilesData();
  return data.activeProfileId;
}

/**
 * Check if there are any profiles
 *
 * @returns true if at least one profile exists
 */
export function hasProfiles(): boolean {
  const data = loadProfilesData();
  return data.profiles.length > 0;
}

/**
 * Reset all profiles (for testing/debugging)
 */
export function resetAllProfiles(): void {
  const emptyData: ProfilesData = {
    profiles: [],
    activeProfileId: null,
  };
  saveProfilesData(emptyData);
}
