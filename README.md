# ✦ Chatty — AI Companion App

A warm, modern AI chat companion built with **Expo SDK 54** and powered by **Google Gemini 2.0 Flash**.

---

## Quick Start

### 1. Unzip and install

```bash
unzip chatty.zip
cd chatty
npm install
```

### 2. Add your Gemini API key

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_key_here
```

> You can also skip this step and enter your key directly inside the app under **Settings → Gemini API Key**.

### 3. Start

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

- iOS: download **Expo Go** from the App Store
- Android: download **Expo Go** from the Play Store

---

## Getting a Gemini API Key

1. Go to **[aistudio.google.com](https://aistudio.google.com)**
2. Sign in with your Google account
3. Click **Get API key** → **Create API key**
4. Copy the key — paste it into `.env` or the Settings tab in the app

The free tier is generous for personal use and requires no billing setup.

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
│   ├── gemini.js                # Gemini REST API — send message
│   ├── contextManager.js        # Trims message history to MAX_CONTEXT_MESSAGES=20
│   ├── memoryManager.js         # Extracts long-term memory via Gemini
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

| Feature | Details |
|---|---|
| **Chat** | Full conversation with Gemini 2.0 Flash via direct REST |
| **Markdown** | AI responses render bold, italic, code, lists, blockquotes |
| **Short-term memory** | Last 20 messages sent as context every turn |
| **Long-term memory** | Gemini extracts profile/preferences/facts every 6 turns |
| **Memory toggle** | Enable/disable in Settings — takes effect immediately |
| **Personality editor** | Edit the AI's system prompt from Settings |
| **History** | Sessions auto-saved, grouped by date, searchable |
| **Persistence** | All data stored locally via AsyncStorage — no server |
| **Animations** | Reanimated 3 — bubble entrance, typing dots, tab icons, spring buttons |

---

## Tech Stack

| Layer | Package |
|---|---|
| Framework | Expo SDK 54 |
| Navigation | Expo Router 4 |
| Chat UI | react-native-gifted-chat |
| State | Zustand 5 |
| Storage | @react-native-async-storage/async-storage |
| Animations | react-native-reanimated 3 |
| Markdown | react-native-markdown-display |
| Icons | @expo/vector-icons (Ionicons) |
| AI | Google Gemini 2.0 Flash (REST — no SDK) |

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
npx expo start --clear
```

**App shows "API Key Missing"**
Enter your Gemini key in the app under **Settings → Gemini API Key**, or add it to `.env` and restart.

**Gemini returns an error**
Check your key is valid at [aistudio.google.com](https://aistudio.google.com). Free tier keys work immediately.

**Expo Go shows a red screen**
Make sure you ran `npm install` first. If the error mentions Reanimated, run `npx expo start --clear` to reset the Metro cache.
