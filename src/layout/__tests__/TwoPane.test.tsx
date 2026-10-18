import { fireEvent, screen } from '@testing-library/react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { DEVICE_PRESETS, renderAtDisplay } from '../../testing';
import { TwoPane } from '../TwoPane';

function StatefulPane({
  name,
  onMount,
}: {
  name: string;
  onMount: (name: string) => void;
}) {
  const [pressCount, setPressCount] = useState(0);
  useEffect(() => onMount(name), [name, onMount]);
  return (
    <Pressable onPress={() => setPressCount(count => count + 1)}>
      <Text>{`${name} pressed ${pressCount}`}</Text>
    </Pressable>
  );
}

function renderTwoPane(
  selectedKey: string | null,
  onMount: (name: string) => void,
) {
  return (
    <TwoPane
      testID="accounts"
      selectedKey={selectedKey}
      list={<StatefulPane name="list" onMount={onMount} />}
      detail={<StatefulPane name="detail" onMount={onMount} />}
    />
  );
}

describe('TwoPane', () => {
  it('shows only the list on a folded phone and keeps the detail mounted but hidden', async () => {
    const onMount = jest.fn();
    await renderAtDisplay(renderTwoPane(null, onMount), {
      device: DEVICE_PRESETS.zFoldOuter,
    });

    expect(screen.getByText('list pressed 0')).toBeTruthy();
    expect(screen.queryByText('detail pressed 0')).toBeNull();
    expect(
      screen.getByText('detail pressed 0', { includeHiddenElements: true }),
    ).toBeTruthy();
    expect(onMount).toHaveBeenCalledTimes(2);
  });

  it('shows both panes after unfolding without remounting either or losing their state', async () => {
    const onMount = jest.fn();
    const { changeDisplay } = await renderAtDisplay(
      renderTwoPane(null, onMount),
      { device: DEVICE_PRESETS.zFoldOuter },
    );
    await fireEvent.press(screen.getByText('list pressed 0'));
    await fireEvent.press(screen.getByText('list pressed 1'));

    await changeDisplay(DEVICE_PRESETS.zFoldInnerFlat);

    expect(screen.getByText('list pressed 2')).toBeTruthy();
    expect(screen.getByText('detail pressed 0')).toBeTruthy();
    expect(onMount).toHaveBeenCalledTimes(2);
  });

  it('keeps state through a full cycle of phone, desktop and back', async () => {
    const onMount = jest.fn();
    const { changeDisplay } = await renderAtDisplay(
      renderTwoPane('account-1', onMount),
      { device: DEVICE_PRESETS.pixelPhone },
    );
    await fireEvent.press(screen.getByText('detail pressed 0'));

    await changeDisplay(DEVICE_PRESETS.desktopWindowMaximised);
    await changeDisplay(DEVICE_PRESETS.zFoldInnerBook);
    await changeDisplay(DEVICE_PRESETS.pixelPhone);

    expect(screen.getByText('detail pressed 1')).toBeTruthy();
    expect(onMount).toHaveBeenCalledTimes(2);
  });

  it('keeps state through every iPhone Duo pose', async () => {
    const onMount = jest.fn();
    const { changeDisplay } = await renderAtDisplay(
      renderTwoPane('account-1', onMount),
      { device: DEVICE_PRESETS.iPhoneDuoOuter },
    );
    await fireEvent.press(screen.getByText('detail pressed 0'));

    await changeDisplay(DEVICE_PRESETS.iPhoneDuoInnerFlat);
    await changeDisplay(DEVICE_PRESETS.iPhoneDuoInnerBook);
    await changeDisplay(DEVICE_PRESETS.iPhoneDuoInnerTabletop);

    expect(screen.getByText('list pressed 0')).toBeTruthy();
    expect(screen.getByText('detail pressed 1')).toBeTruthy();
    expect(onMount).toHaveBeenCalledTimes(2);
  });
});
