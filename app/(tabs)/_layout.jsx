import { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { View, Animated, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';

function TabIcon({ name, focused }) {
  const scale = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: focused ? 1.12 : 1, useNativeDriver: true, speed: 20 }),
      Animated.timing(dotOpacity, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.tabIconWrap}>
      <Animated.View style={[styles.iconContainer, focused && styles.iconContainerActive, { transform: [{ scale }] }]}>
        <Ionicons name={name} size={22} color={focused ? COLORS.salmon : COLORS.textMuted} />
      </Animated.View>
      <Animated.View style={[styles.activeDot, { opacity: dotOpacity }]} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.salmon,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'time' : 'time-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBar,
    borderTopColor: COLORS.borderLight,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 8,
    ...SHADOWS.soft,
  },
  tabLabel: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.medium, letterSpacing: 0.1 },
  tabIconWrap: { alignItems: 'center', gap: 3 },
  iconContainer: { width: 38, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  iconContainerActive: { backgroundColor: COLORS.peachLight },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.salmon, marginTop: -2 },
});
