import { create } from 'zustand';
import { loadSettings, saveSettings } from '../storage/chatStorage';
import { DEFAULT_PERSONALITY } from '../constants/config';

// API key comes from .env only — not stored or editable in app
export const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const useSettingsStore = create((set, get) => ({
  aiName: 'Chatty',
  userName: 'You',
  memoryEnabled: true,
  personalityPrompt: DEFAULT_PERSONALITY,

  initSettings: async () => {
    const saved = await loadSettings();
    if (saved) {
      set({
        aiName: saved.aiName || 'Chatty',
        userName: saved.userName || 'You',
        memoryEnabled: saved.memoryEnabled !== undefined ? saved.memoryEnabled : true,
        personalityPrompt: saved.personalityPrompt || DEFAULT_PERSONALITY,
      });
    }
  },

  _persist: async (patch) => {
    const next = { ...get(), ...patch };
    set(patch);
    await saveSettings({
      aiName: next.aiName,
      userName: next.userName,
      memoryEnabled: next.memoryEnabled,
      personalityPrompt: next.personalityPrompt,
    });
  },

  setAiName: async (name) => get()._persist({ aiName: name || 'Chatty' }),
  setUserName: async (name) => get()._persist({ userName: name || 'You' }),
  setMemoryEnabled: async (val) => get()._persist({ memoryEnabled: val }),
  setPersonalityPrompt: async (val) => get()._persist({ personalityPrompt: val || DEFAULT_PERSONALITY }),
}));

export default useSettingsStore;
