import {
  Text as ReactNativeText,
  type TextProps as ReactNativeTextProps,
  type TextStyle,
} from 'react-native';
import { useWindowWidthClass } from '../responsive/adaptiveDisplayHooks';
import {
  resolveResponsiveValue,
  type ResponsiveValue,
} from '../responsive/responsiveValue';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import type { ColorToken, TypographyVariant } from '../theme/tokens';

export type TextProps = ReactNativeTextProps & {
  variant?: ResponsiveValue<TypographyVariant>;
  color?: ColorToken;
  align?: ResponsiveValue<TextStyle['textAlign']>;
};

/** Drop-in replacement for `Text`: every `Text` prop, plus a typography `variant` that owns font scaling limits. */
export function Text({
  variant = 'bodyMd',
  color = 'textPrimary',
  align,
  style,
  maxFontSizeMultiplier,
  ...textProps
}: TextProps) {
  const theme = useAdaptiveTheme();
  const widthClass = useWindowWidthClass();
  const resolvedVariant =
    resolveResponsiveValue(variant, widthClass) ?? 'bodyMd';
  const {
    maxFontSizeMultiplier: variantMaxFontSizeMultiplier,
    ...typographyStyle
  } = theme.typography[resolvedVariant];
  const textAlign =
    align === undefined ? undefined : resolveResponsiveValue(align, widthClass);

  return (
    <ReactNativeText
      {...textProps}
      maxFontSizeMultiplier={
        maxFontSizeMultiplier ?? variantMaxFontSizeMultiplier
      }
      style={[
        typographyStyle,
        { color: theme.colors[color], textAlign },
        style,
      ]}
    />
  );
}
