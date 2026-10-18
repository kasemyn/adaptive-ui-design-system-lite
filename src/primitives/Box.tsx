import { View, type ViewProps } from 'react-native';
import { useWindowWidthClass } from '../responsive/adaptiveDisplayHooks';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import {
  resolveBoxStyle,
  splitBoxTokenProps,
  type BoxTokenProps,
} from './boxStyle';

export type BoxProps = ViewProps & BoxTokenProps;

/** Drop-in replacement for `View`: every `View` prop, plus theme-token and responsive layout props. */
export function Box({ style, ...props }: BoxProps) {
  const theme = useAdaptiveTheme();
  const widthClass = useWindowWidthClass();
  const { tokenProps, otherProps } = splitBoxTokenProps(props);
  return (
    <View
      {...otherProps}
      style={[resolveBoxStyle(tokenProps, widthClass, theme), style]}
    />
  );
}

export type StackProps = Omit<BoxProps, 'direction'>;

export function VStack(props: StackProps) {
  return <Box {...props} direction="column" />;
}

export function HStack(props: StackProps) {
  return <Box align="center" {...props} direction="row" />;
}
