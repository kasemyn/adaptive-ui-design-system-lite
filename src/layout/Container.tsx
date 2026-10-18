import { StyleSheet } from 'react-native';
import { Box, type BoxProps } from '../primitives/Box';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import type { ContentMaxWidthToken } from '../theme/tokens';

export type ContainerWidth = ContentMaxWidthToken | 'full';

type ContainerProps = BoxProps & {
  contentWidth?: ContainerWidth;
};

/** Caps content at a readable width and centres it, so a maximised desktop window doesn't stretch text edge to edge. */
export function Container({
  contentWidth = 'content',
  style,
  ...boxProps
}: ContainerProps) {
  const theme = useAdaptiveTheme();
  return (
    <Box
      {...boxProps}
      style={[
        styles.centred,
        {
          maxWidth:
            contentWidth === 'full'
              ? undefined
              : theme.contentMaxWidths[contentWidth],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  centred: { width: '100%', alignSelf: 'center' },
});
