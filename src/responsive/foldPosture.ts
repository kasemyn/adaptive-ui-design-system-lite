import type { WindowSize } from './windowSizeClass';

export type FoldPosture = 'flat' | 'book' | 'tabletop';

export type HingeOrientation = 'vertical' | 'horizontal';

export type WindowRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FoldingFeature = WindowRect & {
  state: 'flat' | 'halfOpened';
  orientation: HingeOrientation;
  isSeparating: boolean;
  occlusionType: 'none' | 'full';
};

export type HingeFeature = WindowRect & {
  orientation: HingeOrientation;
  isSeparating: boolean;
  occlusionType: 'none' | 'full';
};

export type WindowLayoutReport = {
  windowSize: WindowSize;
  foldingFeatures: readonly FoldingFeature[];
};

export function classifyFoldPosture(
  foldingFeature: FoldingFeature | null,
): FoldPosture {
  if (!foldingFeature) {
    return 'flat';
  }
  const splitsTheWindow =
    foldingFeature.state === 'halfOpened' || foldingFeature.isSeparating;
  if (!splitsTheWindow) {
    return 'flat';
  }
  return foldingFeature.orientation === 'vertical' ? 'book' : 'tabletop';
}

export function toHingeFeature(
  foldingFeature: FoldingFeature | null,
): HingeFeature | null {
  if (!foldingFeature) {
    return null;
  }
  return {
    x: foldingFeature.x,
    y: foldingFeature.y,
    width: foldingFeature.width,
    height: foldingFeature.height,
    orientation: foldingFeature.orientation,
    isSeparating: foldingFeature.isSeparating,
    occlusionType: foldingFeature.occlusionType,
  };
}

export function findFoldingFeatureInsideWindow(
  report: WindowLayoutReport,
): FoldingFeature | null {
  const { width, height } = report.windowSize;
  return (
    report.foldingFeatures.find(
      feature =>
        feature.x < width &&
        feature.y < height &&
        feature.x + feature.width >= 0 &&
        feature.y + feature.height >= 0,
    ) ?? null
  );
}
