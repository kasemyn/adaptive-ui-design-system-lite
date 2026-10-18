import type { EdgeInsets } from 'react-native-safe-area-context';
import type { FoldingFeature } from '../responsive/foldPosture';
import type { WindowSize } from '../responsive/windowSizeClass';

export type DisplayPreset = {
  windowSize: WindowSize;
  safeAreaInsets: EdgeInsets;
  foldingFeature: FoldingFeature | null;
};

const phoneInsets: EdgeInsets = { top: 32, right: 0, bottom: 24, left: 0 };
const noInsets: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

function verticalFold(
  x: number,
  height: number,
  state: FoldingFeature['state'],
): FoldingFeature {
  return {
    x,
    y: 0,
    width: 0,
    height,
    state,
    orientation: 'vertical',
    isSeparating: state === 'halfOpened',
    occlusionType: 'none',
  };
}

function horizontalFold(
  y: number,
  width: number,
  state: FoldingFeature['state'],
): FoldingFeature {
  return {
    x: 0,
    y,
    width,
    height: 0,
    state,
    orientation: 'horizontal',
    isSeparating: state === 'halfOpened',
    occlusionType: 'none',
  };
}

// Approximate dp values seeded from published specs. Confirm against an emulator or device
// (`adb shell wm size` ÷ (`adb shell wm density` / 160)) before relying on exact boundaries.
export const DEVICE_PRESETS = {
  pixelPhone: {
    windowSize: { width: 412, height: 915 },
    safeAreaInsets: phoneInsets,
    foldingFeature: null,
  },
  pixelPhoneLandscape: {
    windowSize: { width: 915, height: 412 },
    safeAreaInsets: { top: 0, right: 32, bottom: 0, left: 32 },
    foldingFeature: null,
  },
  zFoldOuter: {
    windowSize: { width: 344, height: 882 },
    safeAreaInsets: phoneInsets,
    foldingFeature: null,
  },
  zFoldInnerFlat: {
    windowSize: { width: 690, height: 829 },
    safeAreaInsets: phoneInsets,
    foldingFeature: verticalFold(345, 829, 'flat'),
  },
  zFoldInnerBook: {
    windowSize: { width: 690, height: 829 },
    safeAreaInsets: phoneInsets,
    foldingFeature: verticalFold(345, 829, 'halfOpened'),
  },
  zFoldInnerTabletop: {
    windowSize: { width: 829, height: 690 },
    safeAreaInsets: phoneInsets,
    foldingFeature: horizontalFold(345, 829, 'halfOpened'),
  },
  zFlipCover: {
    windowSize: { width: 384, height: 399 },
    safeAreaInsets: noInsets,
    foldingFeature: null,
  },
  zFlipMain: {
    windowSize: { width: 411, height: 1006 },
    safeAreaInsets: phoneInsets,
    foldingFeature: horizontalFold(503, 411, 'flat'),
  },
  zFlipFlexMode: {
    windowSize: { width: 411, height: 1006 },
    safeAreaInsets: phoneInsets,
    foldingFeature: horizontalFold(503, 411, 'halfOpened'),
  },
  surfaceDuoSingleScreen: {
    windowSize: { width: 540, height: 720 },
    safeAreaInsets: { top: 24, right: 0, bottom: 0, left: 0 },
    foldingFeature: null,
  },
  surfaceDuoSpanned: {
    windowSize: { width: 1114, height: 720 },
    safeAreaInsets: { top: 24, right: 0, bottom: 0, left: 0 },
    foldingFeature: {
      x: 540,
      y: 0,
      width: 34,
      height: 720,
      state: 'flat',
      orientation: 'vertical',
      isSeparating: true,
      occlusionType: 'full',
    },
  },
  // Window sizes from Apple's published iPhone Duo point sizes; insets are placeholders until
  // measured on the iOS 27.1 simulator.
  iPhoneDuoOuter: {
    windowSize: { width: 466, height: 678 },
    safeAreaInsets: phoneInsets,
    foldingFeature: null,
  },
  iPhoneDuoInnerFlat: {
    windowSize: { width: 951, height: 669 },
    safeAreaInsets: { top: 24, right: 0, bottom: 20, left: 0 },
    foldingFeature: verticalFold(475.5, 669, 'flat'),
  },
  iPhoneDuoInnerBook: {
    windowSize: { width: 951, height: 669 },
    safeAreaInsets: { top: 24, right: 0, bottom: 20, left: 0 },
    foldingFeature: verticalFold(475.5, 669, 'halfOpened'),
  },
  iPhoneDuoInnerTabletop: {
    windowSize: { width: 669, height: 951 },
    safeAreaInsets: { top: 24, right: 0, bottom: 20, left: 0 },
    foldingFeature: horizontalFold(475.5, 669, 'halfOpened'),
  },
  iPadMiniPortrait: {
    windowSize: { width: 744, height: 1133 },
    safeAreaInsets: { top: 24, right: 0, bottom: 20, left: 0 },
    foldingFeature: null,
  },
  iPadProLandscape: {
    windowSize: { width: 1376, height: 1032 },
    safeAreaInsets: { top: 24, right: 0, bottom: 20, left: 0 },
    foldingFeature: null,
  },
  iPadSplitViewOneThird: {
    windowSize: { width: 375, height: 1024 },
    safeAreaInsets: { top: 24, right: 0, bottom: 20, left: 0 },
    foldingFeature: null,
  },
  desktopWindowSmall: {
    windowSize: { width: 960, height: 640 },
    safeAreaInsets: noInsets,
    foldingFeature: null,
  },
  desktopWindowMaximised: {
    windowSize: { width: 1920, height: 1040 },
    safeAreaInsets: noInsets,
    foldingFeature: null,
  },
} as const satisfies Record<string, DisplayPreset>;

export type DevicePresetName = keyof typeof DEVICE_PRESETS;
