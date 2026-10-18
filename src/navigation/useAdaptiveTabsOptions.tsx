import {
  BottomTabBar,
  type BottomTabBarProps,
  type BottomTabNavigatorProps,
} from '@react-navigation/bottom-tabs';
import { useCallback } from 'react';
import { I18nManager } from 'react-native';
import { ConsumedSafeAreaEdgesProvider } from '../layout/ConsumedSafeAreaEdges';
import { safeAreaEdgesCoveredByNavigationChrome } from './navigationChromeVariant';
import { NavigationRail } from './NavigationRail';
import { PermanentNavigationDrawer } from './PermanentNavigationDrawer';
import { useNavigationChromeVariant } from './useNavigationChromeVariant';

type TabBarRenderer = NonNullable<BottomTabNavigatorProps['tabBar']>;

function renderStockBottomTabBar(props: BottomTabBarProps) {
  return <BottomTabBar {...props} />;
}

function AdaptiveTabBar({
  renderCompactTabBar,
  ...tabBarProps
}: BottomTabBarProps & { renderCompactTabBar: TabBarRenderer }) {
  const variant = useNavigationChromeVariant();
  switch (variant) {
    case 'bottomBar':
      return <>{renderCompactTabBar(tabBarProps)}</>;
    case 'rail':
      return <NavigationRail {...tabBarProps} />;
    case 'drawer':
      return <PermanentNavigationDrawer {...tabBarProps} />;
  }
}

type AdaptiveTabsOptions = Required<
  Pick<BottomTabNavigatorProps, 'tabBar' | 'screenOptions' | 'screenLayout'>
>;

type UseAdaptiveTabsOptionsArgs = {
  /** The navigator's existing `screenOptions` — move them here from the navigator. */
  screenOptions?: BottomTabNavigatorProps['screenOptions'];
  /**
   * The app's existing custom tab bar, if it has one. It's kept on phones (compact windows); the rail and drawer
   * replace it on larger windows. Defaults to React Navigation's own bottom tab bar.
   */
  tabBar?: TabBarRenderer;
};

/**
 * Spread into an existing `Tab.Navigator` to get a bottom bar, navigation rail or permanent drawer depending on
 * window size and hinge. It's always the same navigator — only its chrome changes — so screens and their state
 * survive fold, unfold and resize.
 */
export function useAdaptiveTabsOptions({
  screenOptions: appScreenOptions,
  tabBar: renderCompactTabBar = renderStockBottomTabBar,
}: UseAdaptiveTabsOptionsArgs = {}): AdaptiveTabsOptions {
  const variant = useNavigationChromeVariant();
  const isRTL = I18nManager.isRTL;
  const tabBarPosition =
    variant === 'bottomBar' ? 'bottom' : isRTL ? 'right' : 'left';
  const coveredEdges = safeAreaEdgesCoveredByNavigationChrome(variant, isRTL);
  const coveredEdgesKey = coveredEdges.join(',');

  const screenOptions = useCallback<
    Extract<AdaptiveTabsOptions['screenOptions'], (...args: never[]) => unknown>
  >(
    screenOptionsProps => ({
      ...(typeof appScreenOptions === 'function'
        ? appScreenOptions(screenOptionsProps)
        : appScreenOptions),
      tabBarPosition,
    }),
    [appScreenOptions, tabBarPosition],
  );

  const screenLayout = useCallback<AdaptiveTabsOptions['screenLayout']>(
    ({ children }) => (
      <ConsumedSafeAreaEdgesProvider
        edges={coveredEdgesKey.split(',') as typeof coveredEdges}
      >
        {children}
      </ConsumedSafeAreaEdgesProvider>
    ),
    [coveredEdgesKey],
  );

  const tabBar = useCallback<TabBarRenderer>(
    tabBarProps => (
      <AdaptiveTabBar
        {...tabBarProps}
        renderCompactTabBar={renderCompactTabBar}
      />
    ),
    [renderCompactTabBar],
  );

  return { tabBar, screenOptions, screenLayout };
}
