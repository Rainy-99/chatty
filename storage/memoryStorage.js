import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LONG_TERM: 'chatty:memory:longterm',
  TURN_COUNT: 'chatty:memory:turncount',
};

// Default empty long-term memory shape
export const DEFAULT_MEMORY = {
  profile: '',
  preferences: [],
  importantEvents: [],
  emotionalPatterns: [],
  updatedAt: null,
};

// ─── Long-term memory ─────────────────────────────────────────────────────────

export async function loadLongTermMemory() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LONG_TERM);
    if (!raw) return { ...DEFAULT_MEMORY };
    const parsed = JSON.parse(raw);
    // Merge with defaults so any new fields are always present
    return { ...DEFAULT_MEMORY, ...parsed };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

export async function saveLongTermMemory(memory) {
  try {
    // Hard caps prevent unbounded AsyncStorage growth
    const safe = {
      ...memory,
      preferences: (memory.preferences || []).slice(-20),
      importantEvents: (memory.importantEvents || []).slice(-30),
      emotionalPatterns: (memory.emotionalPatterns || []).slice(-10),
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(KEYS.LONG_TERM, JSON.stringify(safe));
    return safe;
  } catch (e) {
    console.warn('Failed to save long-term memory:', e);
    return memory;
  }
}

export async function clearLongTermMemory() {
  try {
    await AsyncStorage.multiRemove([KEYS.LONG_TERM, KEYS.TURN_COUNT]);
  } catch (e) {
    console.warn('Failed to clear memory:', e);
  }
}

// ─── Turn counter ─────────────────────────────────────────────────────────────

export async function loadTurnCount() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TURN_COUNT);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export async function saveTurnCount(count) {
  try {
    await AsyncStorage.setItem(KEYS.TURN_COUNT, String(count));
  } catch (e) {
    console.warn('Failed to save turn count:', e);
  }
}
