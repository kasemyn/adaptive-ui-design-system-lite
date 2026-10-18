import {
  isResponsiveValueByWidthClass,
  resolveResponsiveValue,
} from '../responsiveValue';

describe('resolveResponsiveValue', () => {
  it('returns a plain value unchanged at every width class', () => {
    expect(resolveResponsiveValue('md', 'compact')).toBe('md');
    expect(resolveResponsiveValue('md', 'xlarge')).toBe('md');
  });

  it.each([
    ['compact', 'md'],
    ['medium', 'md'],
    ['expanded', 'xl'],
    ['large', 'xl'],
    ['xlarge', 'xl'],
  ] as const)(
    'cascades { compact: md, expanded: xl } at %p to %p',
    (widthClass, expected) => {
      expect(
        resolveResponsiveValue({ compact: 'md', expanded: 'xl' }, widthClass),
      ).toBe(expected);
    },
  );

  it('is undefined below the smallest defined class', () => {
    expect(resolveResponsiveValue({ medium: 2 }, 'compact')).toBeUndefined();
  });

  it('keeps falsy values instead of cascading past them', () => {
    expect(resolveResponsiveValue({ compact: 8, medium: 0 }, 'large')).toBe(0);
  });
});

describe('isResponsiveValueByWidthClass', () => {
  it('does not mistake object-valued props for responsive values', () => {
    expect(isResponsiveValueByWidthClass({ width: 0, height: 2 })).toBe(false);
  });

  it('does not treat an empty object as responsive', () => {
    expect(isResponsiveValueByWidthClass({})).toBe(false);
  });

  it('does not treat arrays as responsive', () => {
    expect(isResponsiveValueByWidthClass([1, 2])).toBe(false);
  });

  it('recognises width-class keyed objects', () => {
    expect(isResponsiveValueByWidthClass({ compact: 1, large: 3 })).toBe(true);
  });
});
