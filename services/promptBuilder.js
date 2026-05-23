import { DEFAULT_PERSONALITY } from '../constants/config';

/**
 * Builds the system instruction string that gets sent to Gemini.
 * Combines: personality + long-term memory (if enabled and present).
 *
 * Kept intentionally lean — no huge prompts.
 */
export function buildSystemPrompt(options = {}) {
  const {
    personalityPrompt = DEFAULT_PERSONALITY,
    memory = null,
    memoryEnabled = true,
    userName = 'the user',
  } = options;

  const parts = [personalityPrompt.trim()];

  if (memoryEnabled && memory) {
    const memorySections = buildMemorySection(memory, userName);
    if (memorySections) {
      parts.push(memorySections);
    }
  }

  return parts.join('\n\n');
}

function buildMemorySection(memory, userName) {
  const lines = [];

  if (memory.profile) {
    lines.push(`About ${userName}: ${memory.profile}`);
  }
  if (memory.preferences?.length > 0) {
    lines.push(`Their preferences: ${memory.preferences.slice(0, 5).join(', ')}.`);
  }
  if (memory.importantEvents?.length > 0) {
    lines.push(`Things you know: ${memory.importantEvents.slice(0, 6).join('; ')}.`);
  }
  if (memory.emotionalPatterns?.length > 0) {
    lines.push(`Communication style notes: ${memory.emotionalPatterns.slice(0, 3).join(', ')}.`);
  }

  if (lines.length === 0) return null;

  return `MEMORY (use naturally, never recite like a list):\n${lines.join('\n')}`;
}
