import { Children, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useWindowWidthClass } from '../responsive/adaptiveDisplayHooks';
import {
  resolveResponsiveValue,
  type ResponsiveValue,
} from '../responsive/responsiveValue';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import type { SpacingToken } from '../theme/tokens';

type GridProps = {
  columns: ResponsiveValue<number>;
  gap?: ResponsiveValue<SpacingToken>;
  children: ReactNode;
};

/**
 * Responsive columns without measuring: cells take a percentage width and gutters come from padding.
 * Each child keeps its position in one flat list when the column count changes, so nothing remounts on unfold.
 */
export function Grid({ columns, gap = 'lg', children }: GridProps) {
  const theme = useAdaptiveTheme();
  const widthClass = useWindowWidthClass();
  const columnCount = Math.max(
    1,
    resolveResponsiveValue(columns, widthClass) ?? 1,
  );
  const gapToken = resolveResponsiveValue(gap, widthClass) ?? 'lg';
  const gapSize = theme.spacing[gapToken];

  return (
    <View
      style={[
        styles.wrappingRow,
        { marginHorizontal: -gapSize / 2, rowGap: gapSize },
      ]}
    >
      {Children.map(children, child => (
        <View
          style={{
            width: `${100 / columnCount}%`,
            paddingHorizontal: gapSize / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrappingRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
