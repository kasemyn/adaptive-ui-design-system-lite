import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, screen } from '@testing-library/react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import { useConsumedSafeAreaEdges } from '../../layout/ConsumedSafeAreaEdges';
import { DEVICE_PRESETS, renderAtDisplay } from '../../testing';
import { useAdaptiveTabsOptions } from '../useAdaptiveTabsOptions';

const Tab = createBottomTabNavigator();

type TabBarRenderer = (props: BottomTabBarProps) => ReactNode;

function renderBrandTabBar({ state }: BottomTabBarProps) {
  return <Text>{`brand tab bar with ${state.routes.length} tabs`}</Text>;
}

const mountedScreens: string[] = [];

function CounterScreen({ name }: { name: string }) {
  const [pressCount, setPressCount] = useState(0);
  const consumedEdges = useConsumedSafeAreaEdges();
  useEffect(() => {
    mountedScreens.push(name);
  }, [name]);
  return (
    <Pressable onPress={() => setPressCount(count => count + 1)}>
      <Text>{`${name} pressed ${pressCount}`}</Text>
      <Text>{`${name} consumed ${consumedEdges.join('+')}`}</Text>
    </Pressable>
  );
}

function HomeScreen() {
  return <CounterScreen name="home" />;
}

function AccountsScreen() {
  return <CounterScreen name="accounts" />;
}

const SCREEN_OPTIONS = { headerShown: false };

function AdaptiveTabs({ tabBar }: { tabBar?: TabBarRenderer }) {
  const adaptiveTabsOptions = useAdaptiveTabsOptions({
    screenOptions: SCREEN_OPTIONS,
    tabBar,
  });
  return (
    <NavigationContainer>
      <Tab.Navigator {...adaptiveTabsOptions}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Accounts" component={AccountsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

describe('useAdaptiveTabsOptions', () => {
  beforeEach(() => {
    mountedScreens.length = 0;
  });

  it('shows the stock bottom tab bar on a phone and marks the bottom edge as covered', async () => {
    await renderAtDisplay(<AdaptiveTabs />, {
      device: DEVICE_PRESETS.pixelPhone,
    });
    expect(screen.getByText('Accounts')).toBeTruthy();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    expect(screen.getByText('home consumed bottom')).toBeTruthy();
  });

  it('shows a navigation rail on an unfolded Z Fold', async () => {
    await renderAtDisplay(<AdaptiveTabs />, {
      device: DEVICE_PRESETS.zFoldInnerFlat,
    });
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('switches bar → rail → drawer without remounting screens or losing their state', async () => {
    const { changeDisplay } = await renderAtDisplay(<AdaptiveTabs />, {
      device: DEVICE_PRESETS.zFoldOuter,
    });
    await fireEvent.press(screen.getByText('home pressed 0'));

    await changeDisplay(DEVICE_PRESETS.zFoldInnerFlat);
    expect(screen.getByText('home consumed left')).toBeTruthy();

    await changeDisplay(DEVICE_PRESETS.desktopWindowMaximised);
    expect(screen.getByText('home pressed 1')).toBeTruthy();

    await changeDisplay(DEVICE_PRESETS.zFoldOuter);
    expect(screen.getByText('home pressed 1')).toBeTruthy();
    expect(mountedScreens).toEqual(['home']);
  });

  it('navigates between tabs from the rail', async () => {
    await renderAtDisplay(<AdaptiveTabs />, {
      device: DEVICE_PRESETS.zFoldInnerFlat,
    });

    await fireEvent.press(screen.getByRole('tab', { name: 'Accounts' }));

    expect(screen.getByText('accounts pressed 0')).toBeTruthy();
    expect(
      screen.getByRole('tab', { name: 'Accounts', selected: true }),
    ).toBeTruthy();
  });

  it("keeps the app's own tab bar on phones and swaps it for the rail on unfold, without remounting screens", async () => {
    const { changeDisplay } = await renderAtDisplay(
      <AdaptiveTabs tabBar={renderBrandTabBar} />,
      { device: DEVICE_PRESETS.zFoldOuter },
    );
    expect(screen.getByText('brand tab bar with 2 tabs')).toBeTruthy();
    await fireEvent.press(screen.getByText('home pressed 0'));

    await changeDisplay(DEVICE_PRESETS.zFoldInnerFlat);

    expect(screen.queryByText('brand tab bar with 2 tabs')).toBeNull();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByText('home pressed 1')).toBeTruthy();
    expect(mountedScreens).toEqual(['home']);
  });
});
