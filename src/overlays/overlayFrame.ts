import type { EdgeInsets } from 'react-native-safe-area-context';
import type { HingeFeature, WindowRect } from '../responsive/foldPosture';
import type { WindowSize } from '../responsive/windowSizeClass';

export type OverlayPlacement =
  | 'fullscreen'
  | 'dialog'
  | 'bottomSheet'
  | 'sideSheet';

export type OverlayFrameInput = {
  placement: OverlayPlacement;
  windowSize: WindowSize;
  safeAreaInsets: EdgeInsets;
  hinge: HingeFeature | null;
  keyboardHeight: number;
  isRTL: boolean;
  dialogMaxWidth: number;
  sideSheetWidth: number;
  bottomSheetMaxWidth: number;
};

export type OverlayFrame = {
  /** The part of the window the overlay may occupy — one side of a separating hinge, above the keyboard. */
  region: WindowRect;
  alignment: 'fill' | 'center' | 'bottom' | 'end';
  surfaceMaxWidth: number;
  surfaceMaxHeight: number;
  /** Safe-area padding for edges where the surface touches the window edge. */
  contentInsets: EdgeInsets;
};

const DIALOG_MARGIN_DP = 24;
const BOTTOM_SHEET_MAX_HEIGHT_RATIO = 0.9;

function fullWindowRect(windowSize: WindowSize): WindowRect {
  return { x: 0, y: 0, ...windowSize };
}

function regionBesideVerticalHinge(
  hinge: HingeFeature,
  windowSize: WindowSize,
  isRTL: boolean,
): WindowRect {
  const endPaneX = hinge.x + hinge.width;
  return isRTL
    ? { x: 0, y: 0, width: hinge.x, height: windowSize.height }
    : {
        x: endPaneX,
        y: 0,
        width: windowSize.width - endPaneX,
        height: windowSize.height,
      };
}

function regionAroundHorizontalHinge(
  hinge: HingeFeature,
  windowSize: WindowSize,
  side: 'above' | 'below',
): WindowRect {
  const belowHingeY = hinge.y + hinge.height;
  return side === 'above'
    ? { x: 0, y: 0, width: windowSize.width, height: hinge.y }
    : {
        x: 0,
        y: belowHingeY,
        width: windowSize.width,
        height: windowSize.height - belowHingeY,
      };
}

function resolveRegionForHinge(input: OverlayFrameInput): WindowRect {
  const { hinge, windowSize, placement, isRTL } = input;
  if (!hinge?.isSeparating) {
    return fullWindowRect(windowSize);
  }
  if (hinge.orientation === 'vertical') {
    return regionBesideVerticalHinge(hinge, windowSize, isRTL);
  }
  if (placement === 'bottomSheet') {
    return regionAroundHorizontalHinge(hinge, windowSize, 'below');
  }
  if (placement === 'fullscreen' && hinge.occlusionType === 'none') {
    return fullWindowRect(windowSize);
  }
  return regionAroundHorizontalHinge(hinge, windowSize, 'above');
}

function excludeKeyboard(
  region: WindowRect,
  windowSize: WindowSize,
  keyboardHeight: number,
): WindowRect {
  const keyboardTop = windowSize.height - keyboardHeight;
  const regionBottom = region.y + region.height;
  if (keyboardHeight <= 0 || keyboardTop >= regionBottom) {
    return region;
  }
  return { ...region, height: Math.max(0, keyboardTop - region.y) };
}

function insetsTouchingWindowEdges(
  region: WindowRect,
  windowSize: WindowSize,
  safeAreaInsets: EdgeInsets,
  keyboardHeight: number,
): EdgeInsets {
  return {
    top: region.y <= 0 ? safeAreaInsets.top : 0,
    left: region.x <= 0 ? safeAreaInsets.left : 0,
    right:
      region.x + region.width >= windowSize.width ? safeAreaInsets.right : 0,
    bottom:
      keyboardHeight <= 0 && region.y + region.height >= windowSize.height
        ? safeAreaInsets.bottom
        : 0,
  };
}

function insetRect(rect: WindowRect, insets: EdgeInsets): WindowRect {
  return {
    x: rect.x + insets.left,
    y: rect.y + insets.top,
    width: rect.width - insets.left - insets.right,
    height: rect.height - insets.top - insets.bottom,
  };
}

export function resolveOverlayFrame(input: OverlayFrameInput): OverlayFrame {
  const { placement, windowSize, safeAreaInsets, keyboardHeight } = input;
  const regionWithoutKeyboard = resolveRegionForHinge(input);
  const region =
    placement === 'sideSheet'
      ? regionWithoutKeyboard
      : excludeKeyboard(regionWithoutKeyboard, windowSize, keyboardHeight);
  const edgeInsets = insetsTouchingWindowEdges(
    region,
    windowSize,
    safeAreaInsets,
    keyboardHeight,
  );

  switch (placement) {
    case 'fullscreen':
      return {
        region,
        alignment: 'fill',
        surfaceMaxWidth: region.width,
        surfaceMaxHeight: region.height,
        contentInsets: edgeInsets,
      };
    case 'dialog': {
      const safeRegion = insetRect(region, edgeInsets);
      return {
        region: safeRegion,
        alignment: 'center',
        surfaceMaxWidth: Math.min(
          input.dialogMaxWidth,
          safeRegion.width - DIALOG_MARGIN_DP * 2,
        ),
        surfaceMaxHeight: safeRegion.height - DIALOG_MARGIN_DP * 2,
        contentInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      };
    }
    case 'bottomSheet':
      return {
        region,
        alignment: 'bottom',
        surfaceMaxWidth: Math.min(input.bottomSheetMaxWidth, region.width),
        surfaceMaxHeight:
          (region.height - edgeInsets.top) * BOTTOM_SHEET_MAX_HEIGHT_RATIO,
        contentInsets: { ...edgeInsets, top: 0 },
      };
    case 'sideSheet':
      return {
        region,
        alignment: 'end',
        surfaceMaxWidth: Math.min(input.sideSheetWidth, region.width),
        surfaceMaxHeight: region.height,
        contentInsets: input.isRTL
          ? { ...edgeInsets, right: 0 }
          : { ...edgeInsets, left: 0 },
      };
  }
}
