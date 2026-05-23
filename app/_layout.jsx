import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import useChatStore, { _registerMemoryStore } from '../store/chatStore';
import useSettingsStore from '../store/settingsStore';
import useMemoryStore from '../store/memoryStore';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  const initChat = useChatStore((s) => s.initChat);
  const initSettings = useSettingsStore((s) => s.initSettings);
  const initMemory = useMemoryStore((s) => s.initMemory);

  useEffect(() => {
    // Register the memory store getter so chatStore can access it
    // without a circular import. Done once at app start.
    _registerMemoryStore(() => useMemoryStore.getState());

    // Init all stores in parallel
    Promise.all([initSettings(), initChat(), initMemory()]).catch(
      (e) => console.warn('Init error:', e)
    );
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
