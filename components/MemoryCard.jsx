import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, TIMING } from '../constants/theme';
import { formatDate } from '../utils/formatters';

export default function MemoryCard({ memory }) {
  const [expanded, setExpanded] = useState(false);
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    Animated.parallel([
      Animated.timing(chevronAnim, { toValue: next ? 1 : 0, duration: TIMING.normal, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: next ? 1 : 0, duration: TIMING.normal, useNativeDriver: true }),
    ]).start();
  };

  const hasContent = memory?.profile || memory?.preferences?.length > 0
    || memory?.importantEvents?.length > 0 || memory?.emotionalPatterns?.length > 0;

  if (!hasContent) {
    return (
      <View style={styles.emptyRow}>
        <Ionicons name="sparkles-outline" size={15} color={COLORS.peachDark} />
        <Text style={styles.emptyText}>Chat a bit and Chatty will start remembering you.</Text>
      </View>
    );
  }

  return (
    <View>
      <Pressable style={styles.header} onPress={toggle}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={14} color={COLORS.salmon} />
          <Text style={styles.headerLabel}>Memory snapshot</Text>
          {memory.updatedAt && <Text style={styles.updatedAt}>· {formatDate(memory.updatedAt)}</Text>}
        </View>
        <Animated.View style={{ transform: [{ rotate: chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
          <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View style={[styles.content, { opacity: contentAnim }]}>
          {memory.profile ? <MemoryRow icon="person-outline" label="Profile" value={memory.profile} /> : null}
          {memory.preferences?.length > 0 && <MemoryRow icon="heart-outline" label="Preferences" value={memory.preferences.join('  ·  ')} />}
          {memory.importantEvents?.length > 0 && <MemoryRow icon="bookmark-outline" label="Known facts" value={memory.importantEvents.join('  ·  ')} />}
          {memory.emotionalPatterns?.length > 0 && <MemoryRow icon="pulse-outline" label="Style notes" value={memory.emotionalPatterns.join('  ·  ')} />}
        </Animated.View>
      )}
    </View>
  );
}

function MemoryRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={12} color={COLORS.salmon} style={styles.rowIcon} />
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md + 2 },
  emptyText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: FONTS.lineHeights.normal },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md + 2 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs + 2, flex: 1 },
  headerLabel: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.text },
  updatedAt: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  content: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, gap: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  rowIcon: { marginTop: 3 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: FONTS.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 2 },
  rowValue: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: FONTS.lineHeights.normal },
});
