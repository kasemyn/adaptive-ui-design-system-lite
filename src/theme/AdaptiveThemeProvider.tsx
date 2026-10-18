import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  contentMaxWidths,
  darkColors,
  lightColors,
  navigationChromeSizes,
  radii,
  spacing,
  typography,
  type ColorPalette,
  type ContentMaxWidthToken,
  type RadiusToken,
  type SpacingToken,
  type TypographyStyle,
  type TypographyVariant,
} from './tokens';

export type AdaptiveTheme = {
  colorScheme: 'light' | 'dark';
  colors: ColorPalette;
  spacing: Record<SpacingToken, number>;
  radii: Record<RadiusToken, number>;
  typography: Record<TypographyVariant, TypographyStyle>;
  contentMaxWidths: Record<ContentMaxWidthToken, number>;
  navigationChromeSizes: typeof navigationChromeSizes;
};

/**
 * Brand values layered over the defaults, so adaptive components match an existing app.
 * Every field is optional; anything left out keeps the package default.
 */
export type AdaptiveThemeOverrides = {
  colors?: { light?: Partial<ColorPalette>; dark?: Partial<ColorPalette> };
  spacing?: Partial<Record<SpacingToken, number>>;
  radii?: Partial<Record<RadiusToken, number>>;
  /** Applied to every typography variant; a variant's own `fontFamily` below still wins. */
  fontFamily?: string;
  typography?: Partial<Record<TypographyVariant, Partial<TypographyStyle>>>;
  contentMaxWidths?: Partial<Record<ContentMaxWidthToken, number>>;
};

function mergeTypography(
  overrides: AdaptiveThemeOverrides,
): Record<TypographyVariant, TypographyStyle> {
  const variants = Object.keys(typography) as TypographyVariant[];
  return Object.fromEntries(
    variants.map(variant => [
      variant,
      {
        ...typography[variant],
        ...(overrides.fontFamily && { fontFamily: overrides.fontFamily }),
        ...overrides.typography?.[variant],
      },
    ]),
  ) as Record<TypographyVariant, TypographyStyle>;
}

export function createAdaptiveTheme(
  colorScheme: 'light' | 'dark',
  overrides: AdaptiveThemeOverrides = {},
): AdaptiveTheme {
  const defaultColors = colorScheme === 'dark' ? darkColors : lightColors;
  return {
    colorScheme,
    colors: { ...defaultColors, ...overrides.colors?.[colorScheme] },
    spacing: { ...spacing, ...overrides.spacing },
    radii: { ...radii, ...overrides.radii },
    typography: mergeTypography(overrides),
    contentMaxWidths: { ...contentMaxWidths, ...overrides.contentMaxWidths },
    navigationChromeSizes,
  };
}

const AdaptiveThemeContext = createContext<AdaptiveTheme | null>(null);

export function useAdaptiveTheme(): AdaptiveTheme {
  const theme = useContext(AdaptiveThemeContext);
  if (!theme) {
    throw new Error(
      'useAdaptiveTheme must be used inside <AdaptiveProvider>. Mount it once at the app root.',
    );
  }
  return theme;
}

type AdaptiveThemeProviderProps = {
  children: ReactNode;
  colorScheme?: 'light' | 'dark';
  theme?: AdaptiveThemeOverrides;
};

export function AdaptiveThemeProvider({
  children,
  colorScheme: forcedColorScheme,
  theme: overrides,
}: AdaptiveThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const colorScheme =
    forcedColorScheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
  const theme = useMemo(
    () => createAdaptiveTheme(colorScheme, overrides),
    [colorScheme, overrides],
  );
  return (
    <AdaptiveThemeContext.Provider value={theme}>
      {children}
    </AdaptiveThemeContext.Provider>
  );
}
