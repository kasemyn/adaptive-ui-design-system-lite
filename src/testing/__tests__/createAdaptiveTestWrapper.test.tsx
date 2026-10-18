import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useAdaptiveLayout } from '../../responsive/adaptiveDisplayHooks';
import { createAdaptiveTestWrapper } from '../createAdaptiveTestWrapper';
import { DEVICE_PRESETS } from '../devicePresets';

function LayoutProbe() {
  const { widthClass, posture } = useAdaptiveLayout();
  return <Text>{`${widthClass}:${posture}`}</Text>;
}

describe('createAdaptiveTestWrapper', () => {
  it('works as a plain `wrapper` option and can simulate a fold', async () => {
    const AdaptiveTestProviders = createAdaptiveTestWrapper(
      DEVICE_PRESETS.zFoldOuter,
    );
    await render(<LayoutProbe />, { wrapper: AdaptiveTestProviders });
    expect(screen.getByText('compact:flat')).toBeTruthy();

    await act(async () =>
      AdaptiveTestProviders.changeDisplay(DEVICE_PRESETS.zFoldInnerBook),
    );

    expect(screen.getByText('medium:book')).toBeTruthy();
  });
});
