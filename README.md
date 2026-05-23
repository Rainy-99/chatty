# ✦ Chatty — AI Companion App

A warm, modern AI chat companion built with **Expo SDK 54** and powered by **Groq Llama 3.3 70b**.

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url> chatty
cd chatty
pnpm install
```

### 2. Add your Groq API key

```bash
cp .env
```

Open `.env` and add your Groq API key:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_groq_api_key_here
```

> **Important**: API key is loaded from `.env` only. Restart the app with `pnpm start -c` after adding the key.

### 3. Start development

```bash
pnpm start
```

Scan the QR code with **Expo Go**:

- **iOS**: Download **Expo Go** from the App Store
- **Android**: Download **Expo Go** from the Play Store

---

## Getting a Groq API Key

1. Go to **[console.groq.com](https://console.groq.com)**
2. Sign up or log in with your account
3. Navigate to **API Keys** → **Create New API Key**
4. Copy the key and paste it into `.env` as `EXPO_PUBLIC_GROQ_API_KEY`
5. Restart the app: `pnpm start -c`

The free tier provides **1,000 requests per day** with no credit card required.

---

## Project Structure

```
chatty/
├── app/
│   ├── _layout.jsx              # Root layout — initialises all stores
│   ├── index.jsx                # Redirects to /chat
│   └── (tabs)/
│       ├── _layout.jsx          # Bottom tab navigator
│       ├── chat.jsx             # Main chat screen
│       ├── history.jsx          # Conversation history with search
│       └── setting.jsx          # Settings and memory controls
├── components/
│   ├── ChatBubble.jsx           # Message bubble with Markdown + entrance animation
│   ├── EmptyState.jsx           # Welcome screen with tappable suggestions
│   ├── HistoryItem.jsx          # History list row with staggered entrance
│   ├── LoadingDots.jsx          # Animated typing indicator
│   ├── MemoryCard.jsx           # Collapsible memory snapshot in Settings
│   ├── MessageInput.jsx         # Input bar with animated focus border
│   └── SettingItem.jsx          # Settings row with spring press feedback
├── constants/
│   ├── config.js                # AI user objects, model name, default personality
│   └── theme.js                 # Colors, typography, spacing, shadows, timing
├── services/
│   ├── gemini.js                # Groq REST API (OpenAI-compatible) — send message
│   ├── contextManager.js        # Trims message history to MAX_CONTEXT_MESSAGES=20
│   ├── memoryManager.js         # Extracts long-term memory via Groq
│   └── promptBuilder.js         # Assembles system prompt (personality + memory)
├── storage/
│   ├── chatStorage.js           # AsyncStorage for messages, sessions, settings
│   └── memoryStorage.js         # AsyncStorage for long-term memory + turn counter
├── store/
│   ├── chatStore.js             # Zustand — messages, sessions, send, clear
│   ├── memoryStore.js           # Zustand — long-term memory, summarisation trigger
│   └── settingsStore.js         # Zustand — API key, names, memory toggle, personality
└── utils/
    └── formatters.js            # formatDate, truncateText
```

---

## Features

| Feature                | Details                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| **Chat**               | Full conversation with Groq Llama 3.3 70b via REST API                 |
| **Markdown**           | AI responses render bold, italic, code, lists, blockquotes             |
| **Short-term memory**  | Last 20 messages sent as context every turn                            |
| **Long-term memory**   | Groq extracts profile/preferences/facts every 6 turns                  |
| **Memory toggle**      | Enable/disable in Settings — takes effect immediately                  |
| **Personality editor** | Edit the AI's system prompt from Settings                              |
| **History**            | Sessions auto-saved, grouped by date, searchable                       |
| **Persistence**        | All data stored locally via AsyncStorage — no server                   |
| **Animations**         | Reanimated 3 — bubble entrance, typing dots, tab icons, spring buttons |

---

## Tech Stack

| Layer      | Package                                         |
| ---------- | ----------------------------------------------- |
| Framework  | Expo SDK 54                                     |
| Navigation | Expo Router 4                                   |
| State      | Zustand 5                                       |
| Storage    | @react-native-async-storage/async-storage       |
| Animations | react-native-reanimated 3                       |
| Markdown   | react-native-markdown-display                   |
| Icons      | @expo/vector-icons (Ionicons)                   |
| AI         | Groq Llama 3.3 70b (OpenAI-compatible REST API) |

---

## Architecture Notes

**No circular imports** — `chatStore` never imports `memoryStore` directly. A `_registerMemoryStore` bridge is set up once at app init in `_layout.jsx`.

**Memory growth is bounded** — `preferences ≤ 20`, `importantEvents ≤ 30`, `emotionalPatterns ≤ 10` enforced on every save.

**Memory updates are fire-and-forget** — summarisation runs every 6 turns, fully async, never blocks the chat response. Failures are caught and logged without crashing.

**Reanimated configured correctly** — `react-native-reanimated/plugin` is the last entry in `babel.config.js` as required. All `.value` mutations happen inside `useEffect` or event handlers, never during render.

**`newArchEnabled: false`** in `app.json` for maximum Expo Go compatibility.

---

## Troubleshooting

**"Metro bundler" error on start**

```bash
pnpm start -c
```

**App shows "API Key Missing"**
Add your Groq API key to `.env` as `EXPO_PUBLIC_GEMINI_API_KEY` and restart with `pnpm start -c`.

**Groq returns an error**

- Check your API key is valid at [console.groq.com](https://console.groq.com/keys)
- Verify you haven't exceeded the free tier rate limit (1,000 req/day)
- Rate limits reset daily. Wait a moment and try again.

**Expo Go shows a red screen**
Make sure you ran `pnpm install` first. If the error mentions Reanimated, run `pnpm start -c` to reset the Metro cache.
