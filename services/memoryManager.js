// Memory extraction via Groq
import { AI_MODEL } from '../constants/config';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const SUMMARIZE_EVERY_N_TURNS = 20;

export async function extractMemoryFromMessages(messages, existingMemory, apiKey) {
  if (!apiKey || !messages || messages.length < 4) return null;

  const recent = [...messages].slice(0, 20).reverse();
  const transcript = recent
    .map((m) => `${m.user._id === 'user' ? 'User' : 'AI'}: ${m.text}`)
    .join('\n');

  const existingSummary = formatExistingMemory(existingMemory);

  const prompt = `You are a memory extraction assistant. Analyze this conversation and extract key information about the user.

${existingSummary ? `EXISTING MEMORY:\n${existingSummary}\n\n` : ''}RECENT CONVERSATION:
${transcript}

Extract and return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "profile": "brief 1-2 sentence description of who the user is",
  "preferences": ["preference 1", "preference 2"],
  "importantEvents": ["event or fact 1", "event or fact 2"],
  "emotionalPatterns": ["pattern 1"]
}

Rules:
- Only include clearly stated information, never infer or assume
- Keep each item under 15 words
- Max 5 preferences, 8 importantEvents, 3 emotionalPatterns
- Merge with existing memory, don't duplicate
- If nothing new was learned, return the existing data
- Return valid JSON only`;

  try {
    const doFetch = () =>
      fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 512,
        }),
      });

    let response = await doFetch();
    if (response.status === 429) {
      await sleep(10000);
      response = await doFetch();
    }
    if (!response.ok) return null;

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed !== 'object' || parsed === null) return null;

    return {
      profile: typeof parsed.profile === 'string' ? parsed.profile : existingMemory.profile,
      preferences: Array.isArray(parsed.preferences) ? parsed.preferences : existingMemory.preferences,
      importantEvents: Array.isArray(parsed.importantEvents) ? parsed.importantEvents : existingMemory.importantEvents,
      emotionalPatterns: Array.isArray(parsed.emotionalPatterns) ? parsed.emotionalPatterns : existingMemory.emotionalPatterns,
    };
  } catch (e) {
    console.warn('Memory extraction failed (non-fatal):', e.message);
    return null;
  }
}

function formatExistingMemory(memory) {
  if (!memory) return '';
  const parts = [];
  if (memory.profile) parts.push(`Profile: ${memory.profile}`);
  if (memory.preferences?.length) parts.push(`Preferences: ${memory.preferences.join(', ')}`);
  if (memory.importantEvents?.length) parts.push(`Known facts: ${memory.importantEvents.join('; ')}`);
  if (memory.emotionalPatterns?.length) parts.push(`Patterns: ${memory.emotionalPatterns.join(', ')}`);
  return parts.join('\n');
}
