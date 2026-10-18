import type { DimensionValue } from 'react-native';
import type { HingeFeature, WindowRect } from '../responsive/foldPosture';
import type {
  WindowHeightClass,
  WindowWidthClass,
} from '../responsive/windowSizeClass';

export type PaneSize =
  | { kind: 'fill' }
  | { kind: 'fixed'; size: DimensionValue }
  | { kind: 'hidden' };

export type TwoPaneArrangement =
  | 'singlePane'
  | 'sideBySide'
  | 'splitByVerticalHinge'
  | 'splitByHorizontalHinge';

export type TwoPaneLayout = {
  arrangement: TwoPaneArrangement;
  /** `column-reverse` puts the detail pane above a horizontal hinge while the tree order stays list-first. */
  direction: 'row' | 'column-reverse';
  listPane: PaneSize;
  detailPane: PaneSize;
  gutterSize: number;
};

export type TwoPaneLayoutInput = {
  widthClass: WindowWidthClass;
  heightClass: WindowHeightClass;
  hinge: HingeFeature | null;
  containerRectInWindow: WindowRect | null;
  listWidth: DimensionValue;
  hasSelection: boolean;
  minPaneSize: number;
  isRTL: boolean;
};

const FILL: PaneSize = { kind: 'fill' };
const HIDDEN: PaneSize = { kind: 'hidden' };

function layoutSinglePane(hasSelection: boolean): TwoPaneLayout {
  return {
    arrangement: 'singlePane',
    direction: 'row',
    listPane: hasSelection ? HIDDEN : FILL,
    detailPane: hasSelection ? FILL : HIDDEN,
    gutterSize: 0,
  };
}

function layoutAroundVerticalHinge(
  hinge: HingeFeature,
  container: WindowRect,
  input: TwoPaneLayoutInput,
): TwoPaneLayout | null {
  const widthBeforeHinge = hinge.x - container.x;
  const widthAfterHinge =
    container.x + container.width - (hinge.x + hinge.width);
  if (Math.min(widthBeforeHinge, widthAfterHinge) < input.minPaneSize) {
    return null;
  }
  return {
    arrangement: 'splitByVerticalHinge',
    direction: 'row',
    listPane: {
      kind: 'fixed',
      size: input.isRTL ? widthAfterHinge : widthBeforeHinge,
    },
    detailPane: FILL,
    gutterSize: hinge.width,
  };
}

function layoutAroundHorizontalHinge(
  hinge: HingeFeature,
  container: WindowRect,
  input: TwoPaneLayoutInput,
): TwoPaneLayout | null {
  const heightAboveHinge = hinge.y - container.y;
  const heightBelowHinge =
    container.y + container.height - (hinge.y + hinge.height);
  if (Math.min(heightAboveHinge, heightBelowHinge) < input.minPaneSize) {
    return null;
  }
  return {
    arrangement: 'splitByHorizontalHinge',
    direction: 'column-reverse',
    listPane: FILL,
    detailPane: { kind: 'fixed', size: heightAboveHinge },
    gutterSize: hinge.height,
  };
}

function hingeCrossesContainer(hinge: HingeFeature, container: WindowRect) {
  return hinge.orientation === 'vertical'
    ? hinge.x > container.x && hinge.x < container.x + container.width
    : hinge.y > container.y && hinge.y < container.y + container.height;
}

/**
 * A separating hinge dictates the split (panes land either side of it); otherwise the width class does, with the
 * divider snapped to a flat fold when there is one.
 * Every arrangement renders the same two panes in the same order — only sizes change — so switching never remounts.
 */
export function computeTwoPaneLayout(input: TwoPaneLayoutInput): TwoPaneLayout {
  const { hinge, containerRectInWindow } = input;

  if (
    hinge?.isSeparating &&
    containerRectInWindow &&
    hingeCrossesContainer(hinge, containerRectInWindow)
  ) {
    const hingeLayout =
      hinge.orientation === 'vertical'
        ? layoutAroundVerticalHinge(hinge, containerRectInWindow, input)
        : input.heightClass !== 'compact'
        ? layoutAroundHorizontalHinge(hinge, containerRectInWindow, input)
        : null;
    if (hingeLayout) {
      return hingeLayout;
    }
  }

  if (input.widthClass === 'compact') {
    return layoutSinglePane(input.hasSelection);
  }

  return {
    arrangement: 'sideBySide',
    direction: 'row',
    listPane: {
      kind: 'fixed',
      size: listWidthAlignedToFlatFold(input) ?? input.listWidth,
    },
    detailPane: FILL,
    gutterSize: 0,
  };
}

/**
 * On a fully open foldable the crease is still visible, so the divider belongs on it rather than a few dp to one
 * side. Only used when both panes stay usable; otherwise the requested `listWidth` wins.
 */
function listWidthAlignedToFlatFold(input: TwoPaneLayoutInput): number | null {
  const { hinge, containerRectInWindow } = input;
  if (
    !hinge ||
    hinge.orientation !== 'vertical' ||
    !containerRectInWindow ||
    !hingeCrossesContainer(hinge, containerRectInWindow)
  ) {
    return null;
  }
  const widthBeforeFold = hinge.x - containerRectInWindow.x;
  const widthAfterFold =
    containerRectInWindow.x +
    containerRectInWindow.width -
    (hinge.x + hinge.width);
  if (Math.min(widthBeforeFold, widthAfterFold) < input.minPaneSize) {
    return null;
  }
  return input.isRTL ? widthAfterFold : widthBeforeFold;
}
