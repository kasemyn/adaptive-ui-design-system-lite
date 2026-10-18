import type { HingeFeature } from '../../responsive/foldPosture';
import {
  computeTwoPaneLayout,
  type TwoPaneLayoutInput,
} from '../twoPaneLayout';

const bookPostureHinge: HingeFeature = {
  x: 345,
  y: 0,
  width: 0,
  height: 829,
  orientation: 'vertical',
  isSeparating: true,
  occlusionType: 'none',
};

const baseInput: TwoPaneLayoutInput = {
  widthClass: 'medium',
  heightClass: 'medium',
  hinge: null,
  containerRectInWindow: null,
  listWidth: '40%',
  hasSelection: false,
  minPaneSize: 240,
  isRTL: false,
};

describe('computeTwoPaneLayout', () => {
  describe('compact width', () => {
    it('shows only the list when nothing is selected', () => {
      expect(
        computeTwoPaneLayout({ ...baseInput, widthClass: 'compact' }),
      ).toMatchObject({
        arrangement: 'singlePane',
        listPane: { kind: 'fill' },
        detailPane: { kind: 'hidden' },
      });
    });

    it('shows only the detail once an item is selected', () => {
      expect(
        computeTwoPaneLayout({
          ...baseInput,
          widthClass: 'compact',
          hasSelection: true,
        }),
      ).toMatchObject({
        arrangement: 'singlePane',
        listPane: { kind: 'hidden' },
        detailPane: { kind: 'fill' },
      });
    });
  });

  it('puts panes side by side from medium width (an unfolded Z Fold is medium, not expanded)', () => {
    expect(computeTwoPaneLayout(baseInput)).toEqual({
      arrangement: 'sideBySide',
      direction: 'row',
      listPane: { kind: 'fixed', size: '40%' },
      detailPane: { kind: 'fill' },
      gutterSize: 0,
    });
  });

  it('puts the divider on the crease of a fully open fold, offset by chrome to the left', () => {
    expect(
      computeTwoPaneLayout({
        ...baseInput,
        widthClass: 'expanded',
        listWidth: 360,
        hinge: {
          ...bookPostureHinge,
          x: 426,
          height: 883,
          isSeparating: false,
        },
        containerRectInWindow: { x: 80, y: 0, width: 772, height: 883 },
      }),
    ).toEqual({
      arrangement: 'sideBySide',
      direction: 'row',
      listPane: { kind: 'fixed', size: 346 },
      detailPane: { kind: 'fill' },
      gutterSize: 0,
    });
  });

  it('keeps the requested list width when snapping to a flat fold would make a pane too narrow', () => {
    expect(
      computeTwoPaneLayout({
        ...baseInput,
        listWidth: 360,
        hinge: { ...bookPostureHinge, isSeparating: false },
        containerRectInWindow: { x: 200, y: 0, width: 490, height: 829 },
      }).listPane,
    ).toEqual({ kind: 'fixed', size: 360 });
  });

  it('splits exactly at a vertical hinge in book posture, offset by chrome to the left', () => {
    expect(
      computeTwoPaneLayout({
        ...baseInput,
        hinge: bookPostureHinge,
        containerRectInWindow: { x: 80, y: 0, width: 610, height: 829 },
      }),
    ).toEqual({
      arrangement: 'splitByVerticalHinge',
      direction: 'row',
      listPane: { kind: 'fixed', size: 265 },
      detailPane: { kind: 'fill' },
      gutterSize: 0,
    });
  });

  it('reserves the occluded Surface Duo hinge as a gutter', () => {
    const layout = computeTwoPaneLayout({
      ...baseInput,
      widthClass: 'expanded',
      hinge: {
        ...bookPostureHinge,
        x: 540,
        width: 34,
        height: 720,
        occlusionType: 'full',
      },
      containerRectInWindow: { x: 0, y: 0, width: 1114, height: 720 },
    });
    expect(layout.listPane).toEqual({ kind: 'fixed', size: 540 });
    expect(layout.gutterSize).toBe(34);
  });

  it('sizes the list from the right edge in RTL, where it sits after the hinge', () => {
    const layout = computeTwoPaneLayout({
      ...baseInput,
      isRTL: true,
      hinge: { ...bookPostureHinge, x: 300, width: 10 },
      containerRectInWindow: { x: 0, y: 0, width: 690, height: 829 },
    });
    expect(layout.listPane).toEqual({ kind: 'fixed', size: 380 });
  });

  it('falls back to the width-class layout when a hinge pane would be too narrow', () => {
    expect(
      computeTwoPaneLayout({
        ...baseInput,
        hinge: bookPostureHinge,
        containerRectInWindow: { x: 160, y: 0, width: 530, height: 829 },
      }).arrangement,
    ).toBe('sideBySide');
  });

  it('puts the detail above a horizontal hinge in tabletop posture', () => {
    expect(
      computeTwoPaneLayout({
        ...baseInput,
        widthClass: 'medium',
        heightClass: 'medium',
        hinge: {
          ...bookPostureHinge,
          x: 0,
          y: 345,
          width: 829,
          height: 0,
          orientation: 'horizontal',
        },
        containerRectInWindow: { x: 0, y: 0, width: 829, height: 690 },
      }),
    ).toEqual({
      arrangement: 'splitByHorizontalHinge',
      direction: 'column-reverse',
      listPane: { kind: 'fill' },
      detailPane: { kind: 'fixed', size: 345 },
      gutterSize: 0,
    });
  });

  it('does not split a compact-height window around a horizontal hinge', () => {
    expect(
      computeTwoPaneLayout({
        ...baseInput,
        widthClass: 'compact',
        heightClass: 'compact',
        hinge: {
          ...bookPostureHinge,
          x: 0,
          y: 200,
          width: 384,
          height: 0,
          orientation: 'horizontal',
        },
        containerRectInWindow: { x: 0, y: 0, width: 384, height: 399 },
      }).arrangement,
    ).toBe('singlePane');
  });

  it('uses the hinge even at compact width (Z Flip flex mode)', () => {
    expect(
      computeTwoPaneLayout({
        ...baseInput,
        widthClass: 'compact',
        heightClass: 'expanded',
        hinge: {
          ...bookPostureHinge,
          x: 0,
          y: 503,
          width: 411,
          height: 0,
          orientation: 'horizontal',
        },
        containerRectInWindow: { x: 0, y: 0, width: 411, height: 1006 },
      }).arrangement,
    ).toBe('splitByHorizontalHinge');
  });
});
