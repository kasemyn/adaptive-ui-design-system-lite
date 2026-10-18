import type { EdgeInsets } from 'react-native-safe-area-context';
import {
  classifyFoldPosture,
  toHingeFeature,
  type FoldingFeature,
  type FoldPosture,
  type HingeFeature,
} from './foldPosture';
import {
  classifyWindowHeight,
  classifyWindowOrientation,
  classifyWindowWidth,
  type WindowHeightClass,
  type WindowOrientation,
  type WindowSize,
  type WindowWidthClass,
} from './windowSizeClass';

export type AdaptiveDisplayInputs = {
  windowSize: WindowSize;
  safeAreaInsets: EdgeInsets;
  foldingFeature: FoldingFeature | null;
};

export type AdaptiveDisplaySnapshot = {
  windowSize: WindowSize;
  widthClass: WindowWidthClass;
  heightClass: WindowHeightClass;
  orientation: WindowOrientation;
  posture: FoldPosture;
  hinge: HingeFeature | null;
  safeAreaInsets: EdgeInsets;
};

export function deriveAdaptiveDisplaySnapshot(
  inputs: AdaptiveDisplayInputs,
): AdaptiveDisplaySnapshot {
  return {
    windowSize: inputs.windowSize,
    widthClass: classifyWindowWidth(inputs.windowSize.width),
    heightClass: classifyWindowHeight(inputs.windowSize.height),
    orientation: classifyWindowOrientation(inputs.windowSize),
    posture: classifyFoldPosture(inputs.foldingFeature),
    hinge: toHingeFeature(inputs.foldingFeature),
    safeAreaInsets: inputs.safeAreaInsets,
  };
}
