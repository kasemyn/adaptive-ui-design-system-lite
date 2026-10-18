import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ReactNode } from 'react';

export type NavigationChromeItem = {
  key: string;
  label: string;
  isFocused: boolean;
  renderIcon: (color: string, size: number) => ReactNode;
  badge: string | number | undefined;
  accessibilityLabel: string | undefined;
  testID: string | undefined;
  onPress: () => void;
  onLongPress: () => void;
};

/**
 * Reads the same per-screen tab options (`title`, `tabBarLabel`, `tabBarIcon`, `tabBarBadge`, …) the stock bottom
 * tab bar uses, so screens configured for tabs render correctly in the rail and drawer without changes.
 */
export function toNavigationChromeItems({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): NavigationChromeItem[] {
  return state.routes.map((route, index) => {
    const { options } = descriptors[route.key]!;
    const isFocused = state.index === index;
    const label =
      typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : options.title ?? route.name;

    return {
      key: route.key,
      label,
      isFocused,
      renderIcon: (color, size) =>
        options.tabBarIcon?.({ focused: isFocused, color, size }),
      badge: options.tabBarBadge,
      accessibilityLabel: options.tabBarAccessibilityLabel,
      testID: options.tabBarButtonTestID,
      onPress: () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      },
      onLongPress: () =>
        navigation.emit({ type: 'tabLongPress', target: route.key }),
    };
  });
}
