import type { TextStyle } from 'react-native';

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radii;

export const contentMaxWidths = {
  text: 680,
  content: 1040,
  wide: 1280,
} as const;

export type ContentMaxWidthToken = keyof typeof contentMaxWidths;

export const navigationChromeSizes = {
  bottomBarHeight: 64,
  railWidth: 80,
  drawerWidth: 280,
} as const;

export const MINIMUM_TOUCH_TARGET_DP = 48;

export type ColorPalette = {
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceSelected: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  danger: string;
  onDanger: string;
  scrim: string;
  focusRing: string;
  hingeGuide: string;
};

export type ColorToken = keyof ColorPalette;

export const lightColors: ColorPalette = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSelected: '#E6EEFF',
  border: '#D9DDE3',
  textPrimary: '#12161C',
  textSecondary: '#5A6270',
  textInverse: '#FFFFFF',
  primary: '#1A56DB',
  primaryPressed: '#1542A8',
  onPrimary: '#FFFFFF',
  danger: '#C62828',
  onDanger: '#FFFFFF',
  scrim: 'rgba(8, 12, 20, 0.48)',
  focusRing: '#6B9BFF',
  hingeGuide: 'rgba(198, 40, 40, 0.35)',
};

export const darkColors: ColorPalette = {
  background: '#0E1116',
  surface: '#161A21',
  surfaceRaised: '#1E232C',
  surfaceSelected: '#1D2B4A',
  border: '#2C323D',
  textPrimary: '#EEF1F5',
  textSecondary: '#A3ABB8',
  textInverse: '#12161C',
  primary: '#6B9BFF',
  primaryPressed: '#4F82F0',
  onPrimary: '#0B1220',
  danger: '#FF6B6B',
  onDanger: '#1A0B0B',
  scrim: 'rgba(0, 0, 0, 0.6)',
  focusRing: '#9DBDFF',
  hingeGuide: 'rgba(255, 107, 107, 0.35)',
};

export type TypographyStyle = Required<
  Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight'>
> & {
  fontFamily?: string;
  letterSpacing?: number;
  maxFontSizeMultiplier: number;
};

export const typography = {
  displayLg: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    maxFontSizeMultiplier: 1.3,
  },
  headingLg: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    maxFontSizeMultiplier: 1.4,
  },
  headingMd: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    maxFontSizeMultiplier: 1.5,
  },
  headingSm: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    maxFontSizeMultiplier: 1.6,
  },
  bodyLg: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
    maxFontSizeMultiplier: 2,
  },
  bodyMd: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    maxFontSizeMultiplier: 2,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    maxFontSizeMultiplier: 2,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
    maxFontSizeMultiplier: 1.6,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    maxFontSizeMultiplier: 1.8,
  },
} as const satisfies Record<string, TypographyStyle>;

export type TypographyVariant = keyof typeof typography;
