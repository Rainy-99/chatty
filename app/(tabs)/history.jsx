import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, SectionList, StyleSheet, Alert,
  TextInput, Pressable, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useChatStore from '../../store/chatStore';
import HistoryItem from '../../components/HistoryItem';
import { COLORS, FONTS, SPACING, RADIUS, TIMING } from '../../constants/theme';

function groupByDate(sessions) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const groups = {};
  sessions.forEach((s) => {
    const t = new Date(s.createdAt).getTime();
    let label;
    if (t >= today) label = 'Today';
    else if (t >= today - 86400000) label = 'Yesterday';
    else if (t >= today - 7 * 86400000) label = 'This Week';
    else if (t >= today - 30 * 86400000) label = 'This Month';
    else label = 'Earlier';
    if (!groups[label]) groups[label] = [];
    groups[label].push(s);
  });
  return ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier']
    .filter((k) => groups[k])
    .map((k) => ({ title: k, data: groups[k] }));
}

function EmptyHistory({ hasSearch }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="time-outline" size={32} color={COLORS.peachDark} />
      </View>
      <Text style={styles.emptyTitle}>{hasSearch ? 'No results' : 'No conversations yet'}</Text>
      <Text style={styles.emptyText}>
        {hasSearch ? 'Try a different search term.' : 'Start chatting and your conversations will be saved here automatically.'}
      </Text>
    </View>
  );
}

function SectionHeader({ title, count }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionBadgeText}>{count}</Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { sessions, loadSession, deleteSession } = useChatStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const borderAnim = useRef(new Animated.Value(0)).current;

  const filtered = useMemo(() => {
    if (!query.trim()) return sessions;
    const q = query.toLowerCase();
    return sessions.filter((s) => (s.preview || '').toLowerCase().includes(q));
  }, [sessions, query]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  const handleLoad = (session) => {
    Alert.alert('Load Conversation', 'This will replace your current chat.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Load', onPress: async () => { await loadSession(session); router.push('/(tabs)/chat'); } },
    ]);
  };

  const handleDelete = (session) => {
    Alert.alert('Delete', 'Remove this conversation from history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(session.id) },
    ]);
  };

  let globalIndex = 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {sessions.length > 0 && <Text style={styles.count}>{sessions.length} chat{sessions.length !== 1 ? 's' : ''}</Text>}
      </View>

      {sessions.length > 0 && (
        <View style={styles.searchWrap}>
          <Animated.View style={[
            styles.searchInner,
            { borderColor: borderAnim.interpolate({ inputRange: [0, 1], outputRange: [COLORS.border, 'rgba(232,112,112,0.45)'] }) },
          ]}>
            <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search conversations…"
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
              onFocus={() => Animated.timing(borderAnim, { toValue: 1, duration: TIMING.normal, useNativeDriver: false }).start()}
              onBlur={() => Animated.timing(borderAnim, { toValue: 0, duration: TIMING.normal, useNativeDriver: false }).start()}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </Pressable>
            )}
          </Animated.View>
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const idx = globalIndex++;
          return <HistoryItem session={item} index={idx} onPress={() => handleLoad(item)} onDelete={() => handleDelete(item)} />;
        }}
        renderSectionHeader={({ section }) => <SectionHeader title={section.title} count={section.data.length} />}
        ListEmptyComponent={<EmptyHistory hasSearch={query.length > 0} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold, color: COLORS.text, letterSpacing: -0.5 },
  count: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2 },
  searchWrap: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  searchInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: Platform.OS === 'ios' ? SPACING.sm + 1 : SPACING.xs + 1, gap: SPACING.sm },
  searchInput: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.text, padding: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: SPACING.lg, paddingBottom: SPACING.sm, backgroundColor: COLORS.background, gap: SPACING.sm },
  sectionTitle: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.9 },
  sectionBadge: { backgroundColor: COLORS.peachLight, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 1 },
  sectionBadgeText: { fontSize: FONTS.sizes.xs, color: COLORS.salmon, fontWeight: FONTS.weights.semibold },
  list: { paddingBottom: SPACING.xxxl, flexGrow: 1 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xxl },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.peachLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: FONTS.lineHeights.relaxed },
});
