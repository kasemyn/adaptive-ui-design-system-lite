import { StyleSheet, View } from 'react-native';
import { useFoldingFeature } from '../responsive/adaptiveDisplayHooks';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';

type HingeGutterProps = {
  /** Tint the gutter so hinge avoidance is visible while developing. */
  showGuide?: boolean;
};

/**
 * Reserves the hinge's thickness inside a row (vertical hinge) or column (horizontal hinge) so no content
 * or touch target sits underneath it. Renders nothing when there is no separating hinge.
 * For whole-layout hinge handling use `TwoPane`, which also places the gutter at the hinge's position.
 */
export function HingeGutter({ showGuide = false }: HingeGutterProps) {
  const theme = useAdaptiveTheme();
  const { hinge } = useFoldingFeature();
  if (!hinge?.isSeparating) {
    return null;
  }
  const guideColor = showGuide ? theme.colors.hingeGuide : undefined;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.stretch,
        { backgroundColor: guideColor },
        hinge.orientation === 'vertical'
          ? { width: hinge.width }
          : { height: hinge.height },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  stretch: { alignSelf: 'stretch' },
});
