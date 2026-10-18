import { useState, type ReactNode } from 'react';
import {
  Pressable as ReactNativePressable,
  type PressableProps as ReactNativePressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';

export type AdaptivePressableState = {
  pressed: boolean;
  hovered: boolean;
  focused: boolean;
};

export type PressableProps = Omit<
  ReactNativePressableProps,
  'style' | 'children'
> & {
  style?:
    | StyleProp<ViewStyle>
    | ((state: AdaptivePressableState) => StyleProp<ViewStyle>);
  children?: ReactNode | ((state: AdaptivePressableState) => ReactNode);
};

// outline* styles exist from React Native 0.77; typed loosely so 0.76 compiles, where the ring is simply not drawn.
function focusRingStyle(color: string): ViewStyle {
  return {
    outlineColor: color,
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineOffset: 2,
  } as ViewStyle;
}

/**
 * `Pressable` that also tracks mouse hover and keyboard focus, which appear once the app runs in a
 * desktop window or on a tablet with a keyboard, and draws a focus ring while focused.
 */
export function Pressable({
  style,
  children,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...pressableProps
}: PressableProps) {
  const theme = useAdaptiveTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <ReactNativePressable
      {...pressableProps}
      onHoverIn={event => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={event => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      onFocus={event => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={event => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={({ pressed }) => {
        const state = { pressed, hovered, focused };
        return [
          typeof style === 'function' ? style(state) : style,
          focused && focusRingStyle(theme.colors.focusRing),
        ];
      }}
    >
      {({ pressed }) =>
        typeof children === 'function'
          ? children({ pressed, hovered, focused })
          : children
      }
    </ReactNativePressable>
  );
}
