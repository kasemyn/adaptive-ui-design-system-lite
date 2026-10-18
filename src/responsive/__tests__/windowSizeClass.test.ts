import {
  classifyWindowHeight,
  classifyWindowOrientation,
  classifyWindowWidth,
  isWindowWidthAtLeast,
} from '../windowSizeClass';

describe('classifyWindowWidth', () => {
  it.each([
    [0, 'compact'],
    [344, 'compact'],
    [599.9, 'compact'],
    [600, 'medium'],
    [690, 'medium'],
    [839, 'medium'],
    [840, 'expanded'],
    [1199, 'expanded'],
    [1200, 'large'],
    [1599, 'large'],
    [1600, 'xlarge'],
    [2560, 'xlarge'],
  ])('classifies %p dp wide as %p', (widthDp, expectedWidthClass) => {
    expect(classifyWindowWidth(widthDp)).toBe(expectedWidthClass);
  });
});

describe('classifyWindowHeight', () => {
  it.each([
    [399, 'compact'],
    [479, 'compact'],
    [480, 'medium'],
    [899, 'medium'],
    [900, 'expanded'],
  ])('classifies %p dp tall as %p', (heightDp, expectedHeightClass) => {
    expect(classifyWindowHeight(heightDp)).toBe(expectedHeightClass);
  });
});

describe('classifyWindowOrientation', () => {
  it('treats a square window as portrait', () => {
    expect(classifyWindowOrientation({ width: 700, height: 700 })).toBe(
      'portrait',
    );
  });

  it('treats a wider-than-tall window as landscape', () => {
    expect(classifyWindowOrientation({ width: 915, height: 412 })).toBe(
      'landscape',
    );
  });
});

describe('isWindowWidthAtLeast', () => {
  it('is inclusive of the minimum class', () => {
    expect(isWindowWidthAtLeast('medium', 'medium')).toBe(true);
  });

  it('is false below the minimum class', () => {
    expect(isWindowWidthAtLeast('compact', 'medium')).toBe(false);
  });

  it('is true above the minimum class', () => {
    expect(isWindowWidthAtLeast('xlarge', 'expanded')).toBe(true);
  });
});
