import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import type { NativeWindowLayout } from '../../native/NativeAdaptiveFold';
import { useFoldingFeature } from '../adaptiveDisplayHooks';
import { AdaptiveDisplayProvider } from '../AdaptiveDisplayProvider';

const initialWindowSize = initialWindowMetrics!.frame;

const bookPostureLayout: NativeWindowLayout = {
  windowWidth: initialWindowSize.width,
  windowHeight: initialWindowSize.height,
  foldingFeatures: [
    {
      x: initialWindowSize.width / 2,
      y: 0,
      width: 0,
      height: initialWindowSize.height,
      state: 'halfOpened',
      orientation: 'vertical',
      isSeparating: true,
      occlusionType: 'none',
    },
  ],
};

const mockGetCurrentWindowLayout = jest.fn<NativeWindowLayout | null, []>();

jest.mock('../../native/NativeAdaptiveFold', () => ({
  __esModule: true,
  default: {
    getCurrentWindowLayout: () => mockGetCurrentWindowLayout(),
    onWindowLayoutChange: () => ({ remove: () => {} }),
  },
}));

function PostureProbe() {
  const { posture } = useFoldingFeature();
  return <Text>{posture}</Text>;
}

describe('AdaptiveDisplayProvider', () => {
  it('picks up a fold report the native side emitted before JS subscribed', async () => {
    mockGetCurrentWindowLayout
      .mockReturnValueOnce(null)
      .mockReturnValue(bookPostureLayout);

    await render(
      <AdaptiveDisplayProvider>
        <PostureProbe />
      </AdaptiveDisplayProvider>,
    );

    expect(screen.getByText('book')).toBeTruthy();
  });
});
