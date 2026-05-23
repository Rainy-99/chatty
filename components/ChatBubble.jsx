import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

// ─── Simple inline Markdown renderer ─────────────────────────────────────────

function parseInline(text, baseStyle, key) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0, m, i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<Text key={`${key}-t${i++}`} style={baseStyle}>{text.slice(last, m.index)}</Text>);
    if (m[2]) parts.push(<Text key={`${key}-b${i++}`} style={[baseStyle, styles.bold]}>{m[2]}</Text>);
    else if (m[3]) parts.push(<Text key={`${key}-i${i++}`} style={[baseStyle, styles.italic]}>{m[3]}</Text>);
    else if (m[4]) parts.push(<Text key={`${key}-c${i++}`} style={[baseStyle, styles.inlineCode]}>{m[4]}</Text>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<Text key={`${key}-t${i++}`} style={baseStyle}>{text.slice(last)}</Text>);
  return parts.length > 0 ? parts : [<Text key={`${key}-plain`} style={baseStyle}>{text}</Text>];
}

function SimpleMarkdown({ text, isUser }) {
  const base = isUser ? styles.userText : styles.aiText;
  const lines = (text || '').split('\n');
  const elements = [];
  let i = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { elements.push(<View key={`g${i}`} style={{ height: 4 }} />); }
    else if (t.startsWith('### ')) elements.push(<Text key={i} style={[base, styles.h3]}>{t.slice(4)}</Text>);
    else if (t.startsWith('## ')) elements.push(<Text key={i} style={[base, styles.h2]}>{t.slice(3)}</Text>);
    else if (t.startsWith('# ')) elements.push(<Text key={i} style={[base, styles.h1]}>{t.slice(2)}</Text>);
    else if (t.startsWith('- ') || t.startsWith('• ')) {
      elements.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={[base, styles.bulletDot]}>·</Text>
          <Text style={[base, styles.bulletText]}>{parseInline(t.slice(2), base, `${i}`)}</Text>
        </View>
      );
    } else if (/^\d+\.\s/.test(t)) {
      const num = t.match(/^(\d+)\./)[1];
      elements.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={[base, styles.bulletDot]}>{num}.</Text>
          <Text style={[base, styles.bulletText]}>{parseInline(t.replace(/^\d+\.\s/, ''), base, `${i}`)}</Text>
        </View>
      );
    } else if (t.startsWith('> ')) {
      elements.push(
        <View key={i} style={[styles.blockquote, isUser && styles.blockquoteUser]}>
          <Text style={[base, styles.italic]}>{t.slice(2)}</Text>
        </View>
      );
    } else if (t.startsWith('```') || t.startsWith('~~~')) {
      // skip fence markers
    } else {
      elements.push(<Text key={i} style={[base, styles.paragraph]}>{parseInline(t, base, `${i}`)}</Text>);
    }
    i++;
  }
  return <>{elements}</>;
}

// ─── Bubble with fade+slide entrance ─────────────────────────────────────────

export default function ChatBubble({ currentMessage }) {
  if (!currentMessage) return null;

  const isUser = currentMessage.user?._id === 'user';
  const text = currentMessage.text || '';
  const time = currentMessage.createdAt
    ? new Date(currentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        isUser ? styles.wrapperUser : styles.wrapperAI,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <SimpleMarkdown text={text} isUser={isUser} />
        <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAI]}>{time}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 4, marginHorizontal: SPACING.base },
  wrapperUser: { alignItems: 'flex-end' },
  wrapperAI: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm + 2,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: RADIUS.xs,
    ...SHADOWS.soft,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderBottomLeftRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.whisper,
  },
  aiText: { color: COLORS.aiBubbleText, fontSize: FONTS.sizes.base, lineHeight: FONTS.lineHeights.relaxed },
  userText: { color: COLORS.userBubbleText, fontSize: FONTS.sizes.base, lineHeight: FONTS.lineHeights.relaxed },
  paragraph: { marginBottom: 2 },
  bold: { fontWeight: FONTS.weights.bold },
  italic: { fontStyle: 'italic' },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FONTS.sizes.sm,
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  h1: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: 4 },
  h2: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, marginBottom: 3 },
  h3: { fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, marginBottom: 2 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2, gap: 6 },
  bulletDot: { fontWeight: FONTS.weights.bold, marginTop: 1, flexShrink: 0 },
  bulletText: { flex: 1 },
  blockquote: { borderLeftWidth: 3, borderLeftColor: COLORS.peach, paddingLeft: SPACING.sm, marginVertical: 2 },
  blockquoteUser: { borderLeftColor: 'rgba(255,255,255,0.5)' },
  time: { fontSize: FONTS.sizes.xs, marginTop: SPACING.xs, alignSelf: 'flex-end', letterSpacing: 0.2 },
  timeUser: { color: 'rgba(255,255,255,0.65)' },
  timeAI: { color: COLORS.textMuted },
});
