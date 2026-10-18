import { act, render, type RenderResult } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import type { AdaptiveDisplayStore } from '../responsive/adaptiveDisplayStore';
import {
  createAdaptiveTestWrapper,
  type AdaptiveTestOptions,
} from './createAdaptiveTestWrapper';
import type { DisplayPreset } from './devicePresets';

export { DEVICE_PRESETS } from './devicePresets';
export type { DevicePresetName, DisplayPreset } from './devicePresets';
export {
  createAdaptiveTestWrapper,
  type AdaptiveTestOptions,
  type AdaptiveTestWrapper,
} from './createAdaptiveTestWrapper';

type RenderAtDisplayOptions = AdaptiveTestOptions & {
  device: DisplayPreset;
};

type RenderAtDisplayResult = RenderResult & {
  /** Simulates a fold, unfold or window resize without unmounting the tree. */
  changeDisplay(nextDevice: DisplayPreset): Promise<void>;
  displayStore: AdaptiveDisplayStore;
};

/**
 * Renders `ui` inside `AdaptiveProvider` as if on `device`, e.g.
 * `await renderAtDisplay(<Dashboard />, { device: DEVICE_PRESETS.zFoldInnerBook })`.
 */
export async function renderAtDisplay(
  ui: ReactElement,
  { device, ...testOptions }: RenderAtDisplayOptions,
): Promise<RenderAtDisplayResult> {
  const AdaptiveTestProviders = createAdaptiveTestWrapper(device, testOptions);
  const result: RenderResult = await render(
    <AdaptiveTestProviders>{ui}</AdaptiveTestProviders>,
  );

  return {
    ...result,
    displayStore: AdaptiveTestProviders.displayStore,
    async changeDisplay(nextDevice) {
      await act(async () => AdaptiveTestProviders.changeDisplay(nextDevice));
    },
  };
}
