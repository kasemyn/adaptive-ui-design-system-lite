import { useContext, type ReactNode } from 'react';
import {
  initialWindowMetrics,
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { LayoutPersistentStateProvider } from './layout/LayoutPersistentState';
import { OverlayHost } from './overlays/OverlayHost';
import type { AdaptiveDisplayStore } from './responsive/adaptiveDisplayStore';
import { AdaptiveDisplayProvider } from './responsive/AdaptiveDisplayProvider';
import {
  AdaptiveThemeProvider,
  type AdaptiveThemeOverrides,
} from './theme/AdaptiveThemeProvider';

type AdaptiveProviderProps = {
  children: ReactNode;
  /** Brand colours, spacing and fonts. Define it outside the component so it keeps one identity. */
  theme?: AdaptiveThemeOverrides;
  /** Follow the app's own dark-mode setting; defaults to the system scheme. */
  colorScheme?: 'light' | 'dark';
  /** Test harness hook; apps should omit it so the provider observes the real window. */
  displayStore?: AdaptiveDisplayStore;
};

function SafeAreaProviderUnlessPresent({ children }: { children: ReactNode }) {
  const outerSafeAreaInsets = useContext(SafeAreaInsetsContext);
  if (outerSafeAreaInsets) {
    return <>{children}</>;
  }
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      {children}
    </SafeAreaProvider>
  );
}

/**
 * Mount once at the app root, outside `NavigationContainer`. It must fill the window: its size is what every
 * size class is computed from. Reuses the app's `SafeAreaProvider` if there is one, and adds one if not.
 */
export function AdaptiveProvider({
  children,
  theme,
  colorScheme,
  displayStore,
}: AdaptiveProviderProps) {
  return (
    <SafeAreaProviderUnlessPresent>
      <AdaptiveDisplayProvider store={displayStore}>
        <AdaptiveThemeProvider colorScheme={colorScheme} theme={theme}>
          <LayoutPersistentStateProvider>
            <OverlayHost>{children}</OverlayHost>
          </LayoutPersistentStateProvider>
        </AdaptiveThemeProvider>
      </AdaptiveDisplayProvider>
    </SafeAreaProviderUnlessPresent>
  );
}
