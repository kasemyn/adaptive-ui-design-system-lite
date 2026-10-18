import { screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Grid } from '../../layout/Grid';
import { DEVICE_PRESETS, renderAtDisplay } from '../../testing';
import { spacing, typography } from '../../theme/tokens';
import { Box } from '../Box';
import { Text } from '../Text';

describe('Box', () => {
  it.each([
    ['zFoldOuter', spacing.md],
    ['iPadProLandscape', spacing.xl],
  ] as const)(
    'resolves responsive padding on %p',
    async (presetName, expectedPadding) => {
      await renderAtDisplay(
        <Box testID="box" padding={{ compact: 'md', expanded: 'xl' }} />,
        { device: DEVICE_PRESETS[presetName] },
      );
      expect(
        StyleSheet.flatten(screen.getByTestId('box').props.style),
      ).toMatchObject({ padding: expectedPadding });
    },
  );

  it('passes View props through and lets `style` override tokens', async () => {
    await renderAtDisplay(
      <Box
        testID="box"
        accessibilityLabel="Card"
        padding="lg"
        style={{ padding: 1 }}
      />,
      { device: DEVICE_PRESETS.pixelPhone },
    );
    const box = screen.getByTestId('box');
    expect(box.props.accessibilityLabel).toBe('Card');
    expect(StyleSheet.flatten(box.props.style)).toMatchObject({ padding: 1 });
  });

  it('switches direction with the width class', async () => {
    const { changeDisplay } = await renderAtDisplay(
      <Box testID="box" direction={{ compact: 'column', medium: 'row' }} />,
      { device: DEVICE_PRESETS.zFoldOuter },
    );
    expect(
      StyleSheet.flatten(screen.getByTestId('box').props.style),
    ).toMatchObject({ flexDirection: 'column' });

    await changeDisplay(DEVICE_PRESETS.zFoldInnerFlat);

    expect(
      StyleSheet.flatten(screen.getByTestId('box').props.style),
    ).toMatchObject({ flexDirection: 'row' });
  });
});

describe('Text', () => {
  it('applies the variant and its font-scaling cap', async () => {
    await renderAtDisplay(<Text variant="headingLg">Balance</Text>, {
      device: DEVICE_PRESETS.pixelPhone,
    });
    const text = screen.getByText('Balance');
    expect(StyleSheet.flatten(text.props.style)).toMatchObject({
      fontSize: typography.headingLg.fontSize,
    });
    expect(text.props.maxFontSizeMultiplier).toBe(
      typography.headingLg.maxFontSizeMultiplier,
    );
  });

  it('resolves a responsive variant', async () => {
    await renderAtDisplay(
      <Text variant={{ compact: 'headingMd', expanded: 'displayLg' }}>
        Title
      </Text>,
      { device: DEVICE_PRESETS.desktopWindowMaximised },
    );
    expect(
      StyleSheet.flatten(screen.getByText('Title').props.style),
    ).toMatchObject({ fontSize: typography.displayLg.fontSize });
  });
});

describe('Grid', () => {
  it('lays cells out in more columns on wider windows', async () => {
    const { changeDisplay } = await renderAtDisplay(
      <Grid columns={{ compact: 1, medium: 2, expanded: 3 }}>
        <Text>cell</Text>
      </Grid>,
      { device: DEVICE_PRESETS.pixelPhone },
    );
    const cellWrapper = () => screen.getByText('cell').parent;
    expect(StyleSheet.flatten(cellWrapper()?.props.style)).toMatchObject({
      width: '100%',
    });

    await changeDisplay(DEVICE_PRESETS.iPadProLandscape);

    expect(StyleSheet.flatten(cellWrapper()?.props.style)).toMatchObject({
      width: `${100 / 3}%`,
    });
  });
});
