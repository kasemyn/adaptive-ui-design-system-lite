import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { I18nManager, StyleSheet, View } from 'react-native';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { useAdaptiveSafeAreaInsets } from '../responsive/adaptiveDisplayHooks';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import { MINIMUM_TOUCH_TARGET_DP } from '../theme/tokens';
import { NavigationBadge } from './NavigationBadge';
import { toNavigationChromeItems } from './navigationChromeItems';

export function PermanentNavigationDrawer(props: BottomTabBarProps) {
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
        styles.drawer,
        {
          width: theme.navigationChromeSizes.drawerWidth + startInset,
          paddingTop: safeAreaInsets.top + theme.spacing.xl,
          paddingBottom: safeAreaInsets.bottom,
          paddingStart: startInset + theme.spacing.md,
          paddingEnd: theme.spacing.md,
          gap: theme.spacing.xs,
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
            style={({ hovered }) => ({
              minHeight: MINIMUM_TOUCH_TARGET_DP + 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              borderRadius: theme.radii.full,
              backgroundColor: item.isFocused
                ? theme.colors.surfaceSelected
                : hovered
                ? theme.colors.background
                : 'transparent',
            })}
          >
            {item.renderIcon(color, 24)}
            <View style={styles.label}>
              <Text
                variant="label"
                color={item.isFocused ? 'primary' : 'textPrimary'}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
            <NavigationBadge badge={item.badge} placement="inline" />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: { borderEndWidth: 1 },
  label: { flex: 1 },
});
