import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function SettingItem({
  icon, label, value, onPress,
  type = 'chevron', switchValue, onSwitchChange, danger, subtitle,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (type === 'switch') return;
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 40 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={({ pressed }) => [styles.item, pressed && type !== 'switch' && styles.pressed]}
        onPress={type !== 'switch' ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={type === 'switch'}
      >
        <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
          <Ionicons name={icon} size={17} color={danger ? '#d05050' : COLORS.salmonDark} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
          {subtitle
            ? <Text style={styles.value}>{subtitle}</Text>
            : value ? <Text style={styles.value} numberOfLines={1}>{value}</Text>
            : null}
        </View>
        {type === 'chevron' && (
          <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} style={styles.chevron} />
        )}
        {type === 'switch' && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: COLORS.border, true: COLORS.peachDark }}
            thumbColor={switchValue ? COLORS.salmon : '#f4f3f4'}
            ios_backgroundColor={COLORS.border}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md + 2, paddingHorizontal: SPACING.base,
    gap: SPACING.md, minHeight: 58,
  },
  pressed: { backgroundColor: COLORS.peachLight },
  iconWrap: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.peachLight, alignItems: 'center', justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: '#fff0f0' },
  content: { flex: 1, gap: 2 },
  label: { fontSize: FONTS.sizes.base, color: COLORS.text, fontWeight: FONTS.weights.medium, letterSpacing: 0.1 },
  labelDanger: { color: '#d05050' },
  value: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: FONTS.lineHeights.tight },
  chevron: { marginLeft: SPACING.xs },
});
