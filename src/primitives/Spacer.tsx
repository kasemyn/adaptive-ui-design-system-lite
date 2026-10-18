import { StyleSheet, View } from 'react-native';
import { useResponsiveValue } from '../responsive/adaptiveDisplayHooks';
import type { ResponsiveValue } from '../responsive/responsiveValue';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import type { SpacingToken } from '../theme/tokens';

type SpacerProps = {
  /** Fixed gap; omit to fill the remaining space in a stack. */
  size?: ResponsiveValue<SpacingToken>;
};

export function Spacer({ size }: SpacerProps) {
  const theme = useAdaptiveTheme();
  const spacingToken = useResponsiveValue(size);
  if (spacingToken === undefined) {
    return <View style={styles.fill} />;
  }
  const length = theme.spacing[spacingToken];
  return <View style={{ width: length, height: length }} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
