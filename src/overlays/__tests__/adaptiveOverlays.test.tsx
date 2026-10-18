import { act, fireEvent, screen } from '@testing-library/react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { DEVICE_PRESETS, renderAtDisplay } from '../../testing';
import { AdaptiveModal } from '../AdaptiveModal';
import { AdaptiveSheet } from '../AdaptiveSheet';

function StatefulContent({ onMount }: { onMount: () => void }) {
  const [pressCount, setPressCount] = useState(0);
  useEffect(onMount, [onMount]);
  return (
    <Pressable onPress={() => setPressCount(count => count + 1)}>
      <Text>{`content pressed ${pressCount}`}</Text>
    </Pressable>
  );
}

function surfaceStyle(title: string) {
  return StyleSheet.flatten(screen.getByLabelText(title).props.style);
}

describe('AdaptiveModal', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders nothing while closed', async () => {
    await renderAtDisplay(
      <AdaptiveModal visible={false} onRequestClose={() => {}} title="Pay">
        <Text>hidden</Text>
      </AdaptiveModal>,
      { device: DEVICE_PRESETS.pixelPhone },
    );
    expect(
      screen.queryByText('hidden', { includeHiddenElements: true }),
    ).toBeNull();
  });

  it('goes from full screen to a dialog when unfolded while open, keeping its content state', async () => {
    const onMount = jest.fn();
    const { changeDisplay } = await renderAtDisplay(
      <AdaptiveModal visible onRequestClose={() => {}} title="Pay">
        <StatefulContent onMount={onMount} />
      </AdaptiveModal>,
      { device: DEVICE_PRESETS.zFoldOuter },
    );
    expect(surfaceStyle('Pay')).toMatchObject({ flex: 1 });
    await fireEvent.press(screen.getByText('content pressed 0'));

    await changeDisplay(DEVICE_PRESETS.zFoldInnerFlat);

    expect(surfaceStyle('Pay')).toMatchObject({ maxWidth: 560 });
    expect(screen.getByText('content pressed 1')).toBeTruthy();
    expect(onMount).toHaveBeenCalledTimes(1);
  });

  it('hides the rest of the app from assistive technology while open', async () => {
    await renderAtDisplay(
      <>
        <Text>app content</Text>
        <AdaptiveModal visible onRequestClose={() => {}} title="Pay">
          <Text>modal content</Text>
        </AdaptiveModal>
      </>,
      { device: DEVICE_PRESETS.pixelPhone },
    );
    expect(screen.queryByText('app content')).toBeNull();
    expect(screen.getByText('modal content')).toBeTruthy();
  });

  it('asks to close from its close button', async () => {
    const onRequestClose = jest.fn();
    await renderAtDisplay(
      <AdaptiveModal visible onRequestClose={onRequestClose} title="Pay">
        <Text>body</Text>
      </AdaptiveModal>,
      { device: DEVICE_PRESETS.pixelPhone },
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('unmounts after its exit animation', async () => {
    function ToggleableModal() {
      const [visible, setVisible] = useState(true);
      return (
        <AdaptiveModal
          visible={visible}
          onRequestClose={() => setVisible(false)}
          title="Pay"
        >
          <Text>body</Text>
        </AdaptiveModal>
      );
    }
    await renderAtDisplay(<ToggleableModal />, {
      device: DEVICE_PRESETS.pixelPhone,
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      screen.queryByText('body', { includeHiddenElements: true }),
    ).toBeNull();
  });
});

describe('AdaptiveSheet', () => {
  it('goes from bottom sheet to side sheet when unfolded while open, keeping its content state', async () => {
    const onMount = jest.fn();
    const { changeDisplay } = await renderAtDisplay(
      <AdaptiveSheet visible onRequestClose={() => {}} title="Filters">
        <StatefulContent onMount={onMount} />
      </AdaptiveSheet>,
      { device: DEVICE_PRESETS.zFoldOuter },
    );
    expect(surfaceStyle('Filters')).toMatchObject({ width: '100%' });
    await fireEvent.press(screen.getByText('content pressed 0'));

    await changeDisplay(DEVICE_PRESETS.zFoldInnerFlat);

    expect(surfaceStyle('Filters')).toMatchObject({ width: 360 });
    expect(screen.getByText('content pressed 1')).toBeTruthy();
    expect(onMount).toHaveBeenCalledTimes(1);
  });
});
