import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const SUGGESTIONS = [
  { emoji: '✨', text: 'Tell me something surprising' },
  { emoji: '💡', text: 'Help me think through a problem' },
  { emoji: '🍳', text: 'What should I cook tonight?' },
  { emoji: '📝', text: "Let's write something together" },
];

function SuggestionChip({ item, index, onPress }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: 400 + index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      <Pressable
        style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
        onPress={() => onPress && onPress(item.text)}
      >
        <Text style={styles.chipEmoji}>{item.emoji}</Text>
        <Text style={styles.chipText}>{item.text}</Text>
        <Text style={styles.chipArrow}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function EmptyState({ onSuggestionPress }) {
  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  return (
    // inverted FlatList flips content — scaleY:-1 undoes that
    <View style={styles.outer}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: heroAnim,
              transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarGlyph}>✦</Text>
            </View>
          </View>
          <Text style={styles.greeting}>Hi, I'm Chatty</Text>
          <Text style={styles.tagline}>What's on your mind today?</Text>
        </Animated.View>

        <View style={styles.suggestions}>
          {SUGGESTIONS.map((item, i) => (
            <SuggestionChip key={i} item={item} index={i} onPress={onSuggestionPress} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    transform: [{ scaleY: -1 }],
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.xxl + SPACING.md,
  },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: COLORS.peachMid,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 3, borderColor: COLORS.peachLight,
    shadowColor: COLORS.salmon, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 6,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.peach,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarGlyph: { fontSize: 30, color: COLORS.salmonDark },
  greeting: {
    fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold,
    color: COLORS.text, letterSpacing: -0.5, marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONTS.sizes.base, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: FONTS.lineHeights.relaxed,
  },
  suggestions: { width: '100%', gap: SPACING.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md + 2,
    borderWidth: 1, borderColor: COLORS.borderLight,
    gap: SPACING.md, ...SHADOWS.whisper,
  },
  chipPressed: { backgroundColor: COLORS.peachLight, borderColor: COLORS.border },
  chipEmoji: { fontSize: 18, width: 26, textAlign: 'center' },
  chipText: {
    flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium, lineHeight: FONTS.lineHeights.normal,
  },
  chipArrow: { fontSize: 20, color: COLORS.textMuted, lineHeight: 22 },
});
