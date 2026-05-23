import { create } from 'zustand';
import {
  loadLongTermMemory,
  saveLongTermMemory,
  clearLongTermMemory,
  loadTurnCount,
  saveTurnCount,
  DEFAULT_MEMORY,
} from '../storage/memoryStorage';
import { extractMemoryFromMessages, SUMMARIZE_EVERY_N_TURNS } from '../services/memoryManager';

const useMemoryStore = create((set, get) => ({
  longTermMemory: { ...DEFAULT_MEMORY },
  turnCount: 0,
  isSummarizing: false,
  lastSummarizedAt: null,

  // ─── Init ─────────────────────────────────────────────────────────
  initMemory: async () => {
    const [memory, turnCount] = await Promise.all([
      loadLongTermMemory(),
      loadTurnCount(),
    ]);
    set({ longTermMemory: memory, turnCount });
  },

  // ─── Called after each AI response ───────────────────────────────
  // Returns true if summarization ran
  maybeUpdateMemory: async (messages, apiKey, memoryEnabled) => {
    if (!memoryEnabled || !apiKey) return false;

    const current = get().turnCount + 1;
    set({ turnCount: current });
    await saveTurnCount(current);

    // Summarize every N turns
    if (current % SUMMARIZE_EVERY_N_TURNS !== 0) return false;
    if (get().isSummarizing) return false;

    set({ isSummarizing: true });
    try {
      const extracted = await extractMemoryFromMessages(
        messages,
        get().longTermMemory,
        apiKey
      );

      if (extracted) {
        const saved = await saveLongTermMemory(extracted);
        set({ longTermMemory: saved, lastSummarizedAt: Date.now() });
      }
    } catch (e) {
      console.warn('Memory update error (non-fatal):', e.message);
    } finally {
      set({ isSummarizing: false });
    }

    return true;
  },

  // ─── Clear all memory ─────────────────────────────────────────────
  clearMemory: async () => {
    await clearLongTermMemory();
    set({ longTermMemory: { ...DEFAULT_MEMORY }, turnCount: 0, lastSummarizedAt: null });
  },
}));

export default useMemoryStore;
