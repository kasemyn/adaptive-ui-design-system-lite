import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { I18nManager, StyleSheet, View } from 'react-native';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { useAdaptiveSafeAreaInsets } from '../responsive/adaptiveDisplayHooks';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import { MINIMUM_TOUCH_TARGET_DP } from '../theme/tokens';
import { NavigationBadge } from './NavigationBadge';
import { toNavigationChromeItems } from './navigationChromeItems';

export function NavigationRail(props: BottomTabBarProps) {
  const theme = useAdaptiveTheme();
  const safeAreaInsets = useAdaptiveSafeAreaInsets();
  const items = toNavigationChromeItems(props);
  const startInset = I18nManager.isRTL
    ? safeAreaInsets.right
    : safeAreaInsets.left;

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.rail,
        {
          width: theme.navigationChromeSizes.railWidth + startInset,
          paddingTop: safeAreaInsets.top + theme.spacing.xl,
          paddingBottom: safeAreaInsets.bottom,
          paddingStart: startInset,
          gap: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderEndColor: theme.colors.border,
        },
      ]}
    >
      {items.map(item => {
        const color = item.isFocused
          ? theme.colors.primary
          : theme.colors.textSecondary;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: item.isFocused }}
            accessibilityLabel={item.accessibilityLabel ?? item.label}
            testID={item.testID}
            onPress={item.onPress}
            onLongPress={item.onLongPress}
            style={[
              styles.item,
              {
                width: theme.navigationChromeSizes.railWidth,
                gap: theme.spacing.xs,
              },
            ]}
          >
            <View
              style={[
                styles.activeIndicator,
                { borderRadius: theme.radii.full },
                item.isFocused && {
                  backgroundColor: theme.colors.surfaceSelected,
                },
              ]}
            >
              {item.renderIcon(color, 24)}
              <NavigationBadge badge={item.badge} />
            </View>
            <Text
              variant="caption"
              color={item.isFocused ? 'primary' : 'textSecondary'}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { alignItems: 'center', borderEndWidth: 1 },
  item: { minHeight: MINIMUM_TOUCH_TARGET_DP, alignItems: 'center' },
  activeIndicator: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
