import type { ReactNode } from 'react';
import { ActivityIndicator, View, type ViewStyle } from 'react-native';
import { useWindowWidthClass } from '../responsive/adaptiveDisplayHooks';
import {
  resolveResponsiveValue,
  type ResponsiveValue,
} from '../responsive/responsiveValue';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import {
  MINIMUM_TOUCH_TARGET_DP,
  type ColorPalette,
  type ColorToken,
} from '../theme/tokens';
import { Pressable, type PressableProps } from './Pressable';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: string;
  variant?: ButtonVariant;
  /** Stretch to the parent's width, e.g. `{ compact: true, medium: false }` for full-width only on phones. */
  fullWidth?: ResponsiveValue<boolean>;
  loading?: boolean;
  leadingIcon?: ReactNode;
};

type ButtonColors = {
  background: ColorToken | 'transparent';
  pressedBackground: ColorToken | 'transparent';
  text: ColorToken;
  border: ColorToken | 'transparent';
};

const BUTTON_COLORS: Record<ButtonVariant, ButtonColors> = {
  primary: {
    background: 'primary',
    pressedBackground: 'primaryPressed',
    text: 'onPrimary',
    border: 'transparent',
  },
  secondary: {
    background: 'surface',
    pressedBackground: 'surfaceSelected',
    text: 'textPrimary',
    border: 'border',
  },
  ghost: {
    background: 'transparent',
    pressedBackground: 'surfaceSelected',
    text: 'primary',
    border: 'transparent',
  },
  danger: {
    background: 'danger',
    pressedBackground: 'danger',
    text: 'onDanger',
    border: 'transparent',
  },
};

function toColor(palette: ColorPalette, token: ColorToken | 'transparent') {
  return token === 'transparent' ? 'transparent' : palette[token];
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  disabled,
  leadingIcon,
  ...pressableProps
}: ButtonProps) {
  const theme = useAdaptiveTheme();
  const widthClass = useWindowWidthClass();
  const colors = BUTTON_COLORS[variant];
  const isFullWidth = resolveResponsiveValue(fullWidth, widthClass) ?? false;
  const isInert = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInert, busy: loading }}
      disabled={isInert}
      {...pressableProps}
      style={({ pressed, hovered }): ViewStyle => ({
        minHeight: MINIMUM_TOUCH_TARGET_DP,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.radii.md,
        borderWidth: colors.border === 'transparent' ? 0 : 1,
        borderColor: toColor(theme.colors, colors.border),
        backgroundColor: toColor(
          theme.colors,
          pressed ? colors.pressedBackground : colors.background,
        ),
        opacity: isInert ? 0.5 : hovered ? 0.92 : 1,
        alignSelf: isFullWidth ? 'stretch' : 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
      })}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors[colors.text]} />
      ) : (
        leadingIcon && <View>{leadingIcon}</View>
      )}
      <Text variant="label" color={colors.text}>
        {children}
      </Text>
    </Pressable>
  );
}
