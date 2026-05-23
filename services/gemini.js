// Groq API — OpenAI-compatible, generous free tier
// Docs: https://console.groq.com/docs/openai
import { AI_MODEL } from '../constants/config';
import { trimMessagesForContext } from './contextManager';
import { buildSystemPrompt } from './promptBuilder';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, body, apiKey) {
  const doFetch = () =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

  const response = await doFetch();
  if (response.ok) return response;

  if (response.status === 429) {
    console.warn('Groq rate limited. Waiting 10s...');
    await sleep(10000);
    const retry = await doFetch();
    if (retry.ok) return retry;
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }

  const err = await response.json().catch(() => ({}));
  const msg = err?.error?.message || `HTTP ${response.status}`;
  throw new Error(`API error: ${msg}`);
}

export async function sendMessage(messages, apiKey, memoryOptions = {}) {
  const key = apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  if (!key) {
    throw new Error(
      'API key not found. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file and restart with --clear.'
    );
  }

  // Trim to last 20 messages, oldest-first for context
  const trimmed = trimMessagesForContext(messages);
  const systemPrompt = buildSystemPrompt(memoryOptions);

  // Groq uses OpenAI format: [{role, content}]
  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...trimmed.map((msg) => ({
      role: msg.user._id === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
  ];

  const body = {
    model: AI_MODEL,
    messages: chatMessages,
    temperature: 0.9,
    max_tokens: 1024,
  };

  const response = await fetchWithRetry(GROQ_API_URL, body, key);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('No response. Please try again.');
  }

  return text;
}
