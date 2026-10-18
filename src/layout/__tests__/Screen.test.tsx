import { screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { DEVICE_PRESETS, renderAtDisplay } from '../../testing';
import { ConsumedSafeAreaEdgesProvider } from '../ConsumedSafeAreaEdges';
import { Screen } from '../Screen';

describe('Screen', () => {
  it('lets non-scrolling content fill the screen, so a TwoPane inside it has height', async () => {
    await renderAtDisplay(
      <Screen scrollable={false}>
        <Text>content</Text>
      </Screen>,
      { device: DEVICE_PRESETS.pixelPhone },
    );
    const container = screen.getByText('content').parent;
    expect(StyleSheet.flatten(container?.props.style)).toMatchObject({
      flex: 1,
    });
  });

  it('pads every safe-area edge by default', async () => {
    await renderAtDisplay(
      <Screen testID="screen">
        <Text>content</Text>
      </Screen>,
      { device: DEVICE_PRESETS.pixelPhone },
    );
    expect(
      StyleSheet.flatten(screen.getByTestId('screen').props.style),
    ).toMatchObject({ paddingTop: 32, paddingBottom: 24 });
  });

  it('skips edges that navigation chrome already covers', async () => {
    await renderAtDisplay(
      <ConsumedSafeAreaEdgesProvider edges={['bottom']}>
        <Screen testID="screen">
          <Text>content</Text>
        </Screen>
      </ConsumedSafeAreaEdgesProvider>,
      { device: DEVICE_PRESETS.pixelPhone },
    );
    expect(
      StyleSheet.flatten(screen.getByTestId('screen').props.style),
    ).toMatchObject({ paddingTop: 32, paddingBottom: 0 });
  });
});
