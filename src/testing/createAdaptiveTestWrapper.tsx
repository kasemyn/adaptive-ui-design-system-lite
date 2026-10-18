import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdaptiveProvider } from '../AdaptiveProvider';
import {
  createAdaptiveDisplayStore,
  type AdaptiveDisplayStore,
} from '../responsive/adaptiveDisplayStore';
import type { AdaptiveThemeOverrides } from '../theme/AdaptiveThemeProvider';
import type { DisplayPreset } from './devicePresets';

export type AdaptiveTestOptions = {
  colorScheme?: 'light' | 'dark';
  theme?: AdaptiveThemeOverrides;
};

export type AdaptiveTestWrapper = ((props: {
  children: ReactNode;
}) => ReactElement) & {
  displayStore: AdaptiveDisplayStore;
  /** Simulates a fold, unfold or resize. Call it inside your test library's `act`. */
  changeDisplay(nextDevice: DisplayPreset): void;
};

function applyDisplayPreset(
  displayStore: AdaptiveDisplayStore,
  device: DisplayPreset,
) {
  displayStore.setWindowSize(device.windowSize);
  displayStore.setSafeAreaInsets(device.safeAreaInsets);
  displayStore.reportWindowLayout({
    windowSize: device.windowSize,
    foldingFeatures: device.foldingFeature ? [device.foldingFeature] : [],
  });
}

/**
 * A `wrapper` for any render function (any Testing Library version, or an app's own `renderWithProviders`):
 * `render(<Dashboard />, { wrapper: createAdaptiveTestWrapper(DEVICE_PRESETS.zFoldOuter) })`.
 */
export function createAdaptiveTestWrapper(
  device: DisplayPreset,
  { colorScheme = 'light', theme }: AdaptiveTestOptions = {},
): AdaptiveTestWrapper {
  const displayStore = createAdaptiveDisplayStore({
    windowSize: device.windowSize,
    safeAreaInsets: device.safeAreaInsets,
    foldingFeature: device.foldingFeature,
  });
  const initialMetrics = {
    frame: { x: 0, y: 0, ...device.windowSize },
    insets: device.safeAreaInsets,
  };

  function AdaptiveTestProviders({ children }: { children: ReactNode }) {
    return (
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <AdaptiveProvider
          colorScheme={colorScheme}
          theme={theme}
          displayStore={displayStore}
        >
          {children}
        </AdaptiveProvider>
      </SafeAreaProvider>
    );
  }

  return Object.assign(AdaptiveTestProviders, {
    displayStore,
    changeDisplay: (nextDevice: DisplayPreset) =>
      applyDisplayPreset(displayStore, nextDevice),
  });
}
