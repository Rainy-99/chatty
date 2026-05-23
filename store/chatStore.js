import { create } from 'zustand';
import uuid from 'react-native-uuid';
import {
  loadMessages,
  saveMessages,
  loadSessions,
  saveSessions,
  clearMessages,
} from '../storage/chatStorage';
import { sendMessage } from '../services/gemini';
import { AI_USER, HUMAN_USER } from '../constants/config';

// memoryStore is accessed lazily to avoid circular deps
let _getMemoryStore = null;
export function _registerMemoryStore(getter) {
  _getMemoryStore = getter;
}

// Messages are stored newest-first (index 0 = latest) to match
// inverted FlatList rendering — index 0 = newest message
function prependMessage(existing, newMsg) {
  return [newMsg, ...existing];
}

const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  sessions: [],

  initChat: async () => {
    const [messages, sessions] = await Promise.all([
      loadMessages(),
      loadSessions(),
    ]);
    set({ messages, sessions });
  },

  sendUserMessage: async (text, apiKey, settingsSnapshot) => {
    const userMsg = {
      _id: uuid.v4(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      user: HUMAN_USER,
    };

    const updatedMessages = prependMessage(get().messages, userMsg);
    set({ messages: updatedMessages, isLoading: true, error: null });
    await saveMessages(updatedMessages);

    try {
      const memoryStore = _getMemoryStore ? _getMemoryStore() : null;
      const memoryOptions = {
        memoryEnabled: settingsSnapshot?.memoryEnabled ?? true,
        personalityPrompt: settingsSnapshot?.personalityPrompt,
        userName: settingsSnapshot?.userName,
        memory: memoryStore?.longTermMemory || null,
      };

      const responseText = await sendMessage(updatedMessages, apiKey, memoryOptions);

      const aiMsg = {
        _id: uuid.v4(),
        text: responseText,
        createdAt: new Date().toISOString(),
        user: AI_USER,
      };

      const finalMessages = prependMessage(get().messages, aiMsg);
      set({ messages: finalMessages, isLoading: false });
      await saveMessages(finalMessages);

      if (memoryStore && settingsSnapshot?.memoryEnabled) {
        memoryStore
          .maybeUpdateMemory(finalMessages, apiKey, settingsSnapshot.memoryEnabled)
          .catch((e) => console.warn('Memory update error:', e));
      }
    } catch (e) {
      set({ isLoading: false, error: e.message });
    }
  },

  clearChat: async () => {
    const currentMessages = get().messages;
    if (currentMessages.length > 0) {
      const session = {
        id: uuid.v4(),
        preview: currentMessages[0]?.text?.slice(0, 80) || 'Chat session',
        messageCount: currentMessages.length,
        createdAt: new Date().toISOString(),
        messages: currentMessages,
      };
      const sessions = [session, ...get().sessions].slice(0, 50);
      set({ sessions });
      await saveSessions(sessions);
    }
    set({ messages: [], error: null });
    await clearMessages();
  },

  loadSession: async (session) => {
    set({ messages: session.messages, error: null });
    await saveMessages(session.messages);
  },

  deleteSession: async (sessionId) => {
    const sessions = get().sessions.filter((s) => s.id !== sessionId);
    set({ sessions });
    await saveSessions(sessions);
  },

  clearError: () => set({ error: null }),
}));

export default useChatStore;
