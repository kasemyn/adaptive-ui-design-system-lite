import { Text as ReactNativeText, StyleSheet } from 'react-native';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import type { ColorToken } from '../theme/tokens';

type IconProps = {
  /** A single glyph. The POC has no icon font; swap this component's body for the real icon set. */
  glyph: string;
  size?: number;
  color?: ColorToken | string;
};

export function Icon({ glyph, size = 24, color = 'textPrimary' }: IconProps) {
  const theme = useAdaptiveTheme();
  const resolvedColor =
    color in theme.colors ? theme.colors[color as ColorToken] : color;
  return (
    <ReactNativeText
      accessibilityElementsHidden
      importantForAccessibility="no"
      allowFontScaling={false}
      style={[
        styles.glyph,
        {
          fontSize: size * 0.8,
          lineHeight: size,
          width: size,
          color: resolvedColor,
        },
      ]}
    >
      {glyph}
    </ReactNativeText>
  );
}

const styles = StyleSheet.create({
  glyph: { textAlign: 'center' },
});
