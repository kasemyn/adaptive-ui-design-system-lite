import {
  classifyFoldPosture,
  findFoldingFeatureInsideWindow,
  type FoldingFeature,
} from '../foldPosture';

const verticalFold: FoldingFeature = {
  x: 345,
  y: 0,
  width: 0,
  height: 829,
  state: 'flat',
  orientation: 'vertical',
  isSeparating: false,
  occlusionType: 'none',
};

describe('classifyFoldPosture', () => {
  it('is flat without a folding feature', () => {
    expect(classifyFoldPosture(null)).toBe('flat');
  });

  it('is flat for a fully opened, non-separating fold', () => {
    expect(classifyFoldPosture(verticalFold)).toBe('flat');
  });

  it('is book for a half-opened vertical fold', () => {
    expect(
      classifyFoldPosture({
        ...verticalFold,
        state: 'halfOpened',
        isSeparating: true,
      }),
    ).toBe('book');
  });

  it('is tabletop for a half-opened horizontal fold', () => {
    expect(
      classifyFoldPosture({
        ...verticalFold,
        orientation: 'horizontal',
        state: 'halfOpened',
        isSeparating: true,
      }),
    ).toBe('tabletop');
  });

  it('is book for a flat but separating vertical hinge (Surface Duo spanned)', () => {
    expect(
      classifyFoldPosture({
        ...verticalFold,
        width: 34,
        isSeparating: true,
        occlusionType: 'full',
      }),
    ).toBe('book');
  });
});

describe('findFoldingFeatureInsideWindow', () => {
  it('drops a fold reported outside a smaller window', () => {
    expect(
      findFoldingFeatureInsideWindow({
        windowSize: { width: 300, height: 829 },
        foldingFeatures: [verticalFold],
      }),
    ).toBeNull();
  });

  it('keeps a fold that crosses the window', () => {
    expect(
      findFoldingFeatureInsideWindow({
        windowSize: { width: 690, height: 829 },
        foldingFeatures: [verticalFold],
      }),
    ).toBe(verticalFold);
  });
});
