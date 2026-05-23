import React, { useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  Alert, Platform, KeyboardAvoidingView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useChatStore from '../../store/chatStore';
import useSettingsStore, { API_KEY } from '../../store/settingsStore';
import useMemoryStore from '../../store/memoryStore';
import ChatBubble from '../../components/ChatBubble';
import MessageInput from '../../components/MessageInput';
import LoadingDots from '../../components/LoadingDots';
import EmptyState from '../../components/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, TIMING } from '../../constants/theme';

export default function ChatScreen() {
  const { messages, isLoading, error, sendUserMessage, clearChat, clearError } = useChatStore();
  const { memoryEnabled, personalityPrompt, userName } = useSettingsStore();
  const { isSummarizing } = useMemoryStore();
  const flatListRef = useRef(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: TIMING.slow, useNativeDriver: true }).start();
  }, []);
  const headerStyle = {
    opacity: headerAnim,
    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
  };

  useEffect(() => {
    if (error) Alert.alert('Oops', error, [{ text: 'OK', onPress: clearError }]);
  }, [error]);

  const handleSend = useCallback((text) => {
    sendUserMessage(text, API_KEY, { memoryEnabled, personalityPrompt, userName });
  }, [memoryEnabled, personalityPrompt, userName, sendUserMessage]);

  const handleNewChat = () => {
    if (messages.length === 0) return;
    Alert.alert('New Chat', 'Start fresh? This chat will be saved to History.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New Chat', style: 'destructive', onPress: clearChat },
    ]);
  };

  const statusLine = isLoading ? 'Thinking…' : isSummarizing ? 'Saving memory…' : 'Online';

  const renderItem = useCallback(({ item }) => <ChatBubble currentMessage={item} />, []);
  const keyExtractor = useCallback((item) => item._id, []);
  const ListHeader = useCallback(
  () => (isLoading ? <LoadingDots /> : null),
  [isLoading],
  );
  const ListEmpty = useCallback(() => <EmptyState onSuggestionPress={handleSend} />, [handleSend]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarGlyph}>✦</Text>
            </View>
            <View
              style={[styles.statusDot, isLoading && styles.statusDotActive]}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Chatty</Text>
            <Text style={styles.headerSub}>{statusLine}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {memoryEnabled && (
            <View style={styles.memoryPill}>
              <Ionicons name="sparkles" size={10} color={COLORS.salmonDark} />
              <Text style={styles.memoryPillText}>Memory on</Text>
            </View>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed,
            ]}
            onPress={handleNewChat}
            hitSlop={8}
          >
            <Ionicons
              name="create-outline"
              size={19}
              color={COLORS.salmonDark}
            />
          </Pressable>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          inverted
          contentContainerStyle={styles.listContent}
          style={styles.list}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === "android"}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={15}
        />
        <MessageInput onSend={handleSend} isLoading={isLoading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.peach, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.peachDark },
  avatarGlyph: { fontSize: 17, color: COLORS.salmonDark },
  statusDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#9dc99d', borderWidth: 2, borderColor: COLORS.background },
  statusDotActive: { backgroundColor: COLORS.peachDark },
  headerText: { gap: 1 },
  headerTitle: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, color: COLORS.text, letterSpacing: -0.3 },
  headerSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 0.1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  memoryPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.peachLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm + 2, paddingVertical: SPACING.xxs + 2, borderWidth: 1, borderColor: COLORS.border },
  memoryPillText: { fontSize: 11, color: COLORS.salmonDark, fontWeight: FONTS.weights.medium },
  iconBtn: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: COLORS.peachLight, alignItems: 'center', justifyContent: 'center' },
  iconBtnPressed: { backgroundColor: COLORS.peachMid },
  body: { flex: 1 },
  list: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingVertical: SPACING.sm, flexGrow: 1 },
});
