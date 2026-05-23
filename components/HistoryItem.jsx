import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, TIMING } from '../constants/theme';
import { formatDate, truncateText } from '../utils/formatters';

export default function HistoryItem({ session, onPress, onDelete, index = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: TIMING.slow,
      delay: index * 45, useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 40 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  const preview = truncateText((session.preview || '').replace(/[#*`_~>]/g, '').trim(), 72);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          { scale },
        ],
      }}
    >
      <Pressable
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.salmon} />
        </View>
        <View style={styles.content}>
          <Text style={styles.preview} numberOfLines={2}>{preview || 'Conversation'}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
            <Text style={styles.metaText}>
              {session.messageCount} messages · {formatDate(session.createdAt)}
            </Text>
          </View>
        </View>
        <Pressable style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 8 }}>
          <Ionicons name="trash-outline" size={15} color={COLORS.textMuted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md, paddingLeft: SPACING.base, paddingRight: SPACING.md,
    marginHorizontal: SPACING.base, marginBottom: SPACING.sm,
    gap: SPACING.md, borderWidth: 1, borderColor: COLORS.borderLight,
    ...SHADOWS.whisper,
  },
  pressed: { backgroundColor: COLORS.peachLight, borderColor: COLORS.border },
  iconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.peachLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  content: { flex: 1, gap: SPACING.xxs + 2 },
  preview: { fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: FONTS.weights.medium, lineHeight: FONTS.lineHeights.normal },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs + 2 },
  metaText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 0.1 },
  deleteBtn: { padding: SPACING.xs, flexShrink: 0 },
});
