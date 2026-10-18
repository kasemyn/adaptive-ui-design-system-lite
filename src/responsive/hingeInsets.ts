import type { EdgeInsets } from 'react-native-safe-area-context';
import type { HingeFeature } from './foldPosture';
import type { WindowSize } from './windowSizeClass';

/** Physical side of the hinge: left/top is `beforeHinge`, right/bottom is `afterHinge`. */
export type HingeRegion = 'beforeHinge' | 'afterHinge';

export const NO_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * Insets that confine content to one side of a separating hinge, so it never renders underneath or across it.
 */
export function hingeToInsets(
  hinge: HingeFeature | null,
  windowSize: WindowSize,
  region: HingeRegion,
): EdgeInsets {
  if (!hinge || !hinge.isSeparating) {
    return NO_INSETS;
  }
  if (hinge.orientation === 'vertical') {
    return region === 'beforeHinge'
      ? { ...NO_INSETS, right: windowSize.width - hinge.x }
      : { ...NO_INSETS, left: hinge.x + hinge.width };
  }
  return region === 'beforeHinge'
    ? { ...NO_INSETS, bottom: windowSize.height - hinge.y }
    : { ...NO_INSETS, top: hinge.y + hinge.height };
}
