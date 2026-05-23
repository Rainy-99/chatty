import React, { useState, useRef } from 'react';
import { View, TextInput, Pressable, Animated, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function MessageInput({ onSend, isLoading }) {
  const [text, setText] = useState('');
  const sendScale = useRef(new Animated.Value(1)).current;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.85, useNativeDriver: true, speed: 40 }),
      Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    onSend(trimmed);
    setText('');
  };

  // TextInput is ALWAYS editable — only the send button checks isLoading
  const canSend = text.trim().length > 0 && !isLoading;

  return (
    <View style={styles.wrapper}>
      <View style={styles.inner}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message Chatty…"
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={2000}
          editable={true}
          blurOnSubmit={false}
          scrollEnabled
        />
        <Animated.View style={{ transform: [{ scale: sendScale }] }}>
          <Pressable
            style={[styles.sendBtn, canSend ? styles.sendBtnActive : styles.sendBtnInactive]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Ionicons name="arrow-up" size={17} color={canSend ? '#fff' : COLORS.textMuted} />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.sm : SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingLeft: SPACING.base,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
    shadowColor: '#c06040',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    maxHeight: 130,
    minHeight: 38,
    paddingTop: Platform.OS === 'ios' ? 9 : 5,
    paddingBottom: Platform.OS === 'ios' ? 9 : 5,
    lineHeight: FONTS.lineHeights.relaxed,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
    marginBottom: 3,
  },
  sendBtnActive: {
    backgroundColor: COLORS.salmon,
    shadowColor: COLORS.salmon,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnInactive: { backgroundColor: COLORS.peachLight },
});
