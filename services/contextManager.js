// Context window management — keep prompts lean and bounded

export const MAX_CONTEXT_MESSAGES = 20;

/**
 * Returns the N most recent messages in oldest-first order.
 * Messages are stored newest-first (index 0 = latest).
 * Gemini API requires oldest-first, so we slice then reverse.
 */
export function trimMessagesForContext(messages, maxMessages = MAX_CONTEXT_MESSAGES) {
  if (!messages || messages.length === 0) return [];
  return [...messages].slice(0, maxMessages).reverse();
}

/**
 * Converts trimmed messages to Gemini contents format.
 */
export function messagesToGeminiContents(trimmedMessages) {
  return trimmedMessages.map((msg) => ({
    role: msg.user._id === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));
}
