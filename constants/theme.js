export const COLORS = {
  // Brand palette
  peach: '#ffdab9',
  salmon: '#e87070',
  cream: '#fffaf5',

  // Extended
  peachLight: '#fff3ea',
  peachMid: '#ffe8d0',
  peachDark: '#f5c49a',
  salmonLight: '#f5a0a0',
  salmonDark: '#c85050',
  warmWhite: '#fffdf9',

  // Neutrals — slightly cooler so text is crisper
  text: '#271a1a',
  textSecondary: '#6e5050',
  textMuted: '#a87878',
  border: '#eedad0',
  borderLight: '#f5e8de',

  // Surfaces
  background: '#fffaf5',
  surface: '#ffffff',
  surfaceWarm: '#fff6ee',
  surfaceRaised: '#fffcf9',
  tabBar: '#ffffff',

  // Bubbles
  userBubble: '#e87070',
  userBubbleGradientEnd: '#d95f5f',
  aiBubble: '#ffffff',
  userBubbleText: '#ffffff',
  aiBubbleText: '#271a1a',

  // Utility
  divider: '#f2e4d8',
  scrim: 'rgba(39, 26, 26, 0.28)',
};

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 18,
    normal: 22,
    relaxed: 26,
  },
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  full: 999,
};

export const SHADOWS = {
  // Near-invisible — just lifts surface off background
  whisper: {
    shadowColor: '#c06040',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  soft: {
    shadowColor: '#c06040',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: '#c06040',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
  },
  // For bottom sheets / modals
  heavy: {
    shadowColor: '#c06040',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Animation timing presets — keep consistent across all components
export const TIMING = {
  fast: 150,
  normal: 220,
  slow: 350,
  verySlow: 500,
};
