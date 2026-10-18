import { StyleSheet, View } from 'react-native';
import { useNavigationChromeVariant } from '../navigation/useNavigationChromeVariant';
import { Text } from '../primitives/Text';
import {
  useAdaptiveLayout,
  useAdaptiveSafeAreaInsets,
} from '../responsive/adaptiveDisplayHooks';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';

/**
 * Development readout of what adaptive layouts are reacting to (size classes and fold posture). Render it once
 * next to your navigator, e.g. `{__DEV__ && <AdaptiveDebugBadge />}`. Sits bottom-end, above a bottom tab bar
 * when there is one, and ignores touches.
 */
export function AdaptiveDebugBadge() {
  const theme = useAdaptiveTheme();
  const { widthClass, heightClass, posture } = useAdaptiveLayout();
  const safeAreaInsets = useAdaptiveSafeAreaInsets();
  const bottomChromeHeight =
    useNavigationChromeVariant() === 'bottomBar'
      ? theme.navigationChromeSizes.bottomBarHeight
      : 0;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.badge,
        {
          bottom: safeAreaInsets.bottom + bottomChromeHeight + theme.spacing.sm,
          end: safeAreaInsets.right + theme.spacing.sm,
          backgroundColor: theme.colors.textPrimary,
          borderRadius: theme.radii.full,
          paddingHorizontal: theme.spacing.sm,
        },
      ]}
    >
      <Text variant="caption" color="textInverse">
        {`${widthClass} × ${heightClass} · ${posture}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', opacity: 0.8, paddingVertical: 2 },
});
