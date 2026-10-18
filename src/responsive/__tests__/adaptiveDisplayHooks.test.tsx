import { act, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { DEVICE_PRESETS, renderAtDisplay } from '../../testing';
import {
  useAdaptiveLayout,
  useAdaptiveWindowSize,
  useFoldingFeature,
  useHingeInsets,
  useResponsiveValue,
  useWindowSizeClass,
} from '../adaptiveDisplayHooks';

function WindowSizeClassProbe({ onRender }: { onRender: () => void }) {
  onRender();
  const { widthClass, heightClass } = useWindowSizeClass();
  return <Text>{`${widthClass}/${heightClass}`}</Text>;
}

function WindowSizeProbe({ onRender }: { onRender: () => void }) {
  onRender();
  const { width } = useAdaptiveWindowSize();
  return <Text>{`width:${width}`}</Text>;
}

describe('useWindowSizeClass', () => {
  it('reports the size class of the rendered display', async () => {
    await renderAtDisplay(<WindowSizeClassProbe onRender={() => {}} />, {
      device: DEVICE_PRESETS.zFoldInnerFlat,
    });
    expect(screen.getByText('medium/medium')).toBeTruthy();
  });

  it('does not re-render while a desktop window is dragged within one size class', async () => {
    const onSizeClassRender = jest.fn();
    const onWindowSizeRender = jest.fn();
    const { displayStore } = await renderAtDisplay(
      <>
        <WindowSizeClassProbe onRender={onSizeClassRender} />
        <WindowSizeProbe onRender={onWindowSizeRender} />
      </>,
      { device: DEVICE_PRESETS.desktopWindowSmall },
    );
    onSizeClassRender.mockClear();
    onWindowSizeRender.mockClear();

    await act(async () => {
      for (let width = 900; width < 1000; width += 10) {
        displayStore.setWindowSize({ width, height: 640 });
      }
    });

    expect(onSizeClassRender).not.toHaveBeenCalled();
    expect(onWindowSizeRender).toHaveBeenCalled();
    expect(screen.getByText('width:990')).toBeTruthy();
  });

  it('re-renders when the drag crosses a size class boundary', async () => {
    const { changeDisplay } = await renderAtDisplay(
      <WindowSizeClassProbe onRender={() => {}} />,
      { device: DEVICE_PRESETS.zFoldOuter },
    );
    expect(screen.getByText('compact/medium')).toBeTruthy();

    await changeDisplay(DEVICE_PRESETS.desktopWindowMaximised);

    expect(screen.getByText('xlarge/expanded')).toBeTruthy();
  });
});

function FoldingFeatureProbe() {
  const { posture, hinge } = useFoldingFeature();
  const afterHingeInsets = useHingeInsets('afterHinge');
  return (
    <Text>{`${posture}:${hinge?.orientation ?? 'none'}:${
      afterHingeInsets.left
    }`}</Text>
  );
}

describe('useFoldingFeature', () => {
  it('is flat with no hinge on a regular phone', async () => {
    await renderAtDisplay(<FoldingFeatureProbe />, {
      device: DEVICE_PRESETS.pixelPhone,
    });
    expect(screen.getByText('flat:none:0')).toBeTruthy();
  });

  it('tracks folding into book posture', async () => {
    const { changeDisplay } = await renderAtDisplay(<FoldingFeatureProbe />, {
      device: DEVICE_PRESETS.zFoldInnerFlat,
    });
    expect(screen.getByText('flat:vertical:0')).toBeTruthy();

    await changeDisplay(DEVICE_PRESETS.zFoldInnerBook);

    expect(screen.getByText('book:vertical:345')).toBeTruthy();
  });

  it('keeps Surface Duo content clear of the physical hinge', async () => {
    await renderAtDisplay(<FoldingFeatureProbe />, {
      device: DEVICE_PRESETS.surfaceDuoSpanned,
    });
    expect(screen.getByText('book:vertical:574')).toBeTruthy();
  });
});

function ResponsiveGapProbe() {
  const gap = useResponsiveValue({ compact: 'md', expanded: 'xl' });
  return <Text>{`gap:${gap}`}</Text>;
}

describe('useResponsiveValue', () => {
  it.each([
    ['zFoldOuter', 'gap:md'],
    ['zFoldInnerFlat', 'gap:md'],
    ['iPadProLandscape', 'gap:xl'],
  ] as const)('resolves on %p to %p', async (presetName, expectedText) => {
    await renderAtDisplay(<ResponsiveGapProbe />, {
      device: DEVICE_PRESETS[presetName],
    });
    expect(screen.getByText(expectedText)).toBeTruthy();
  });
});

function AdaptiveLayoutProbe({ onRender }: { onRender: () => void }) {
  onRender();
  const { widthClass, posture, isAtLeast } = useAdaptiveLayout();
  return (
    <Text>{`${widthClass}:${posture}:${
      isAtLeast('medium') ? 'two-column' : 'one-column'
    }`}</Text>
  );
}

describe('useAdaptiveLayout', () => {
  it('combines size class, posture and a width comparison', async () => {
    const { changeDisplay } = await renderAtDisplay(
      <AdaptiveLayoutProbe onRender={() => {}} />,
      { device: DEVICE_PRESETS.zFoldOuter },
    );
    expect(screen.getByText('compact:flat:one-column')).toBeTruthy();

    await changeDisplay(DEVICE_PRESETS.zFoldInnerBook);

    expect(screen.getByText('medium:book:two-column')).toBeTruthy();
  });

  it('follows an iPhone Duo from closed, to open, to book and tabletop', async () => {
    const { changeDisplay } = await renderAtDisplay(
      <AdaptiveLayoutProbe onRender={() => {}} />,
      { device: DEVICE_PRESETS.iPhoneDuoOuter },
    );
    expect(screen.getByText('compact:flat:one-column')).toBeTruthy();

    await changeDisplay(DEVICE_PRESETS.iPhoneDuoInnerFlat);
    expect(screen.getByText('expanded:flat:two-column')).toBeTruthy();

    await changeDisplay(DEVICE_PRESETS.iPhoneDuoInnerBook);
    expect(screen.getByText('expanded:book:two-column')).toBeTruthy();

    await changeDisplay(DEVICE_PRESETS.iPhoneDuoInnerTabletop);
    expect(screen.getByText('medium:tabletop:two-column')).toBeTruthy();
  });

  it('does not re-render while a desktop window is dragged within one size class', async () => {
    const onRender = jest.fn();
    const { displayStore } = await renderAtDisplay(
      <AdaptiveLayoutProbe onRender={onRender} />,
      { device: DEVICE_PRESETS.desktopWindowSmall },
    );
    onRender.mockClear();

    await act(async () => {
      for (let width = 900; width < 1000; width += 10) {
        displayStore.setWindowSize({ width, height: 640 });
      }
    });

    expect(onRender).not.toHaveBeenCalled();
  });
});
