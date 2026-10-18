import { render, screen } from '@testing-library/react-native';
import { useContext } from 'react';
import { StyleSheet, Text as ReactNativeText } from 'react-native';
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { AdaptiveProvider } from '../../AdaptiveProvider';
import { Text } from '../../primitives/Text';
import {
  createAdaptiveTheme,
  type AdaptiveThemeOverrides,
} from '../AdaptiveThemeProvider';
import { lightColors, spacing, typography } from '../tokens';

const brandTheme: AdaptiveThemeOverrides = {
  colors: { light: { primary: '#00A86B' }, dark: { primary: '#5FE0A8' } },
  spacing: { lg: 20 },
  fontFamily: 'BrandSans',
  typography: { headingLg: { fontSize: 30, fontFamily: 'BrandSerif' } },
};

describe('createAdaptiveTheme', () => {
  it('keeps the defaults when there are no overrides', () => {
    const theme = createAdaptiveTheme('light');
    expect(theme.colors).toEqual(lightColors);
    expect(theme.spacing).toEqual(spacing);
    expect(theme.typography).toEqual(typography);
  });

  it('layers brand colours for the active scheme only', () => {
    expect(createAdaptiveTheme('light', brandTheme).colors).toEqual({
      ...lightColors,
      primary: '#00A86B',
    });
    expect(createAdaptiveTheme('dark', brandTheme).colors.primary).toBe(
      '#5FE0A8',
    );
  });

  it('overrides individual spacing tokens', () => {
    expect(createAdaptiveTheme('light', brandTheme).spacing).toEqual({
      ...spacing,
      lg: 20,
    });
  });

  it('applies the brand font to every variant, letting a variant override it', () => {
    const theme = createAdaptiveTheme('light', brandTheme);
    expect(theme.typography.bodyMd).toEqual({
      ...typography.bodyMd,
      fontFamily: 'BrandSans',
    });
    expect(theme.typography.headingLg).toEqual({
      ...typography.headingLg,
      fontSize: 30,
      fontFamily: 'BrandSerif',
    });
  });
});

describe('AdaptiveProvider', () => {
  it('renders package components with the brand theme', async () => {
    await render(
      <AdaptiveProvider theme={brandTheme} colorScheme="light">
        <Text variant="bodyMd" color="primary">
          Branded
        </Text>
      </AdaptiveProvider>,
    );
    expect(
      StyleSheet.flatten(screen.getByText('Branded').props.style),
    ).toMatchObject({ color: '#00A86B', fontFamily: 'BrandSans' });
  });

  function SafeAreaProbe() {
    const insets = useContext(SafeAreaInsetsContext);
    return (
      <ReactNativeText>
        {insets ? `top:${insets.top}` : 'missing'}
      </ReactNativeText>
    );
  }

  it('adds a SafeAreaProvider when the app has none', async () => {
    await render(
      <AdaptiveProvider>
        <SafeAreaProbe />
      </AdaptiveProvider>,
    );
    expect(screen.queryByText('missing')).toBeNull();
  });

  it("reuses the app's own SafeAreaProvider", async () => {
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 400, height: 800 },
          insets: { top: 47, right: 0, bottom: 34, left: 0 },
        }}
      >
        <AdaptiveProvider>
          <SafeAreaProbe />
        </AdaptiveProvider>
      </SafeAreaProvider>,
    );
    expect(screen.getByText('top:47')).toBeTruthy();
  });
});
