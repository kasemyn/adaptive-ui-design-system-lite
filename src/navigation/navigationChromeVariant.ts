import type { SafeAreaEdge } from '../layout/ConsumedSafeAreaEdges';
import type { HingeFeature } from '../responsive/foldPosture';
import type {
  WindowHeightClass,
  WindowWidthClass,
} from '../responsive/windowSizeClass';

export type NavigationChromeVariant = 'bottomBar' | 'rail' | 'drawer';

const PERMANENT_DRAWER_MIN_WINDOW_WIDTH_DP = 1000;

/** A 280dp drawer leaves too little room for content below this; an unfolded Pixel Fold (~850dp) gets the rail. */
export function isWindowWideEnoughForPermanentDrawer(
  windowWidthDp: number,
): boolean {
  return windowWidthDp > PERMANENT_DRAWER_MIN_WINDOW_WIDTH_DP;
}

/**
 * Bottom bar on compact width, rail in between, permanent drawer on windows wider than 1000dp.
 * A short window (phone landscape) or a vertical separating hinge always gets the rail.
 */
export function resolveNavigationChromeVariant({
  widthClass,
  heightClass,
  isWideEnoughForDrawer,
  hinge,
}: {
  widthClass: WindowWidthClass;
  heightClass: WindowHeightClass;
  isWideEnoughForDrawer: boolean;
  hinge: HingeFeature | null;
}): NavigationChromeVariant {
  if (widthClass === 'compact') {
    return 'bottomBar';
  }
  const hasVerticalSeparatingHinge =
    hinge?.isSeparating === true && hinge.orientation === 'vertical';
  if (
    !isWideEnoughForDrawer ||
    heightClass === 'compact' ||
    hasVerticalSeparatingHinge
  ) {
    return 'rail';
  }
  return 'drawer';
}

export function safeAreaEdgesCoveredByNavigationChrome(
  variant: NavigationChromeVariant,
  isRTL: boolean,
): readonly SafeAreaEdge[] {
  if (variant === 'bottomBar') {
    return ['bottom'];
  }
  return [isRTL ? 'right' : 'left'];
}
