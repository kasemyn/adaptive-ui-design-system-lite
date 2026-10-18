import type { HingeFeature } from '../foldPosture';
import { hingeToInsets, NO_INSETS } from '../hingeInsets';

const surfaceDuoHinge: HingeFeature = {
  x: 540,
  y: 0,
  width: 34,
  height: 720,
  orientation: 'vertical',
  isSeparating: true,
  occlusionType: 'full',
};

const windowSize = { width: 1114, height: 720 };

describe('hingeToInsets', () => {
  it('has no insets without a hinge', () => {
    expect(hingeToInsets(null, windowSize, 'beforeHinge')).toEqual(NO_INSETS);
  });

  it('has no insets for a non-separating hinge', () => {
    expect(
      hingeToInsets(
        { ...surfaceDuoHinge, isSeparating: false },
        windowSize,
        'afterHinge',
      ),
    ).toEqual(NO_INSETS);
  });

  it('confines content to the left screen', () => {
    expect(hingeToInsets(surfaceDuoHinge, windowSize, 'beforeHinge')).toEqual({
      ...NO_INSETS,
      right: 574,
    });
  });

  it('confines content to the right screen, clear of the hinge', () => {
    expect(hingeToInsets(surfaceDuoHinge, windowSize, 'afterHinge')).toEqual({
      ...NO_INSETS,
      left: 574,
    });
  });

  it('confines content above and below a horizontal hinge', () => {
    const tabletopHinge: HingeFeature = {
      ...surfaceDuoHinge,
      x: 0,
      y: 400,
      width: 1114,
      height: 0,
      orientation: 'horizontal',
    };
    const tallWindow = { width: 1114, height: 800 };
    expect(hingeToInsets(tabletopHinge, tallWindow, 'beforeHinge')).toEqual({
      ...NO_INSETS,
      bottom: 400,
    });
    expect(hingeToInsets(tabletopHinge, tallWindow, 'afterHinge')).toEqual({
      ...NO_INSETS,
      top: 400,
    });
  });
});
