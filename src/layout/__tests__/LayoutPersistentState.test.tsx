import { fireEvent, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { DEVICE_PRESETS, renderAtDisplay } from '../../testing';
import { useLayoutPersistentState } from '../LayoutPersistentState';

function PersistedCounter() {
  const [count, setCount] = useLayoutPersistentState('counter', 0);
  return (
    <Pressable onPress={() => setCount(previous => previous + 1)}>
      <Text>{`count ${count}`}</Text>
    </Pressable>
  );
}

function RemountingHost() {
  const [mountGeneration, setMountGeneration] = useState(0);
  return (
    <>
      <PersistedCounter key={mountGeneration} />
      <Pressable onPress={() => setMountGeneration(previous => previous + 1)}>
        <Text>remount</Text>
      </Pressable>
    </>
  );
}

describe('useLayoutPersistentState', () => {
  it('restores the value after its component is remounted', async () => {
    await renderAtDisplay(<RemountingHost />, {
      device: DEVICE_PRESETS.pixelPhone,
    });
    await fireEvent.press(screen.getByText('count 0'));
    await fireEvent.press(screen.getByText('count 1'));

    await fireEvent.press(screen.getByText('remount'));

    expect(screen.getByText('count 2')).toBeTruthy();
  });
});
