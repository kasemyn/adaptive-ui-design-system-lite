import type { HingeFeature } from '../../responsive/foldPosture';
import { classifyWindowWidth } from '../../responsive/windowSizeClass';
import {
  isWindowWideEnoughForPermanentDrawer,
  resolveNavigationChromeVariant,
} from '../navigationChromeVariant';

const bookPostureHinge: HingeFeature = {
  x: 345,
  y: 0,
  width: 0,
  height: 829,
  orientation: 'vertical',
  isSeparating: true,
  occlusionType: 'none',
};

function variantForWindow(
  windowWidthDp: number,
  heightClass: 'compact' | 'medium' | 'expanded' = 'medium',
  hinge: HingeFeature | null = null,
) {
  return resolveNavigationChromeVariant({
    widthClass: classifyWindowWidth(windowWidthDp),
    heightClass,
    isWideEnoughForDrawer: isWindowWideEnoughForPermanentDrawer(windowWidthDp),
    hinge,
  });
}

describe('resolveNavigationChromeVariant', () => {
  it.each([
    [412, 'bottomBar'],
    [690, 'rail'],
    [852, 'rail'],
    [1000, 'rail'],
    [1001, 'drawer'],
    [1376, 'drawer'],
  ] as const)('is %p dp wide -> %p', (windowWidthDp, expected) => {
    expect(variantForWindow(windowWidthDp)).toBe(expected);
  });

  it('uses a rail rather than a drawer on a short window', () => {
    expect(variantForWindow(1200, 'compact')).toBe('rail');
  });

  it('uses a rail rather than a drawer across a vertical separating hinge', () => {
    expect(
      variantForWindow(1114, 'medium', {
        ...bookPostureHinge,
        x: 540,
        width: 34,
      }),
    ).toBe('rail');
  });

  it('keeps the bottom bar on a compact window even with a hinge', () => {
    expect(
      variantForWindow(411, 'expanded', {
        ...bookPostureHinge,
        orientation: 'horizontal',
      }),
    ).toBe('bottomBar');
  });
});
