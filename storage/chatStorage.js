import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MESSAGES: 'chatty:messages',
  SETTINGS: 'chatty:settings',
  SESSIONS: 'chatty:sessions',
};

// ─── Messages ────────────────────────────────────────────────────────────────

export async function loadMessages() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.MESSAGES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveMessages(messages) {
  try {
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save messages:', e);
  }
}

export async function clearMessages() {
  try {
    await AsyncStorage.removeItem(KEYS.MESSAGES);
  } catch (e) {
    console.warn('Failed to clear messages:', e);
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

// ─── Sessions (history) ───────────────────────────────────────────────────────

export async function loadSessions() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions) {
  try {
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to save sessions:', e);
  }
}
