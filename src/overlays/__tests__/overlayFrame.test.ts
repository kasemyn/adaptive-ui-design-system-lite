import type { HingeFeature } from '../../responsive/foldPosture';
import { resolveOverlayFrame, type OverlayFrameInput } from '../overlayFrame';
import {
  DEFAULT_MODAL_PRESENTATION,
  DEFAULT_SHEET_PRESENTATION,
  resolveModalPlacement,
  resolveSheetPlacement,
} from '../overlayPlacement';

const noInsets = { top: 0, right: 0, bottom: 0, left: 0 };

const baseInput: OverlayFrameInput = {
  placement: 'dialog',
  windowSize: { width: 1024, height: 768 },
  safeAreaInsets: noInsets,
  hinge: null,
  keyboardHeight: 0,
  isRTL: false,
  dialogMaxWidth: 560,
  sideSheetWidth: 360,
  bottomSheetMaxWidth: 640,
};

const surfaceDuoHinge: HingeFeature = {
  x: 540,
  y: 0,
  width: 34,
  height: 720,
  orientation: 'vertical',
  isSeparating: true,
  occlusionType: 'full',
};

const tabletopHinge: HingeFeature = {
  x: 0,
  y: 345,
  width: 829,
  height: 0,
  orientation: 'horizontal',
  isSeparating: true,
  occlusionType: 'none',
};

describe('resolveOverlayFrame', () => {
  it('centres a dialog in the whole window when there is no hinge', () => {
    expect(resolveOverlayFrame(baseInput)).toMatchObject({
      region: { x: 0, y: 0, width: 1024, height: 768 },
      alignment: 'center',
      surfaceMaxWidth: 560,
    });
  });

  it('confines a dialog to the screen after a Surface Duo hinge so it never straddles it', () => {
    const frame = resolveOverlayFrame({
      ...baseInput,
      windowSize: { width: 1114, height: 720 },
      hinge: surfaceDuoHinge,
    });
    expect(frame.region).toEqual({ x: 574, y: 0, width: 540, height: 720 });
    expect(frame.surfaceMaxWidth).toBe(540 - 48);
  });

  it('uses the screen before the hinge in RTL', () => {
    const frame = resolveOverlayFrame({
      ...baseInput,
      windowSize: { width: 1114, height: 720 },
      hinge: surfaceDuoHinge,
      isRTL: true,
    });
    expect(frame.region).toEqual({ x: 0, y: 0, width: 540, height: 720 });
  });

  it('puts a dialog above and a bottom sheet below a tabletop hinge', () => {
    const tabletop = {
      ...baseInput,
      windowSize: { width: 829, height: 690 },
      hinge: tabletopHinge,
    };
    expect(resolveOverlayFrame(tabletop).region).toEqual({
      x: 0,
      y: 0,
      width: 829,
      height: 345,
    });
    expect(
      resolveOverlayFrame({ ...tabletop, placement: 'bottomSheet' }).region,
    ).toEqual({ x: 0, y: 345, width: 829, height: 345 });
  });

  it('shrinks the region above the keyboard for a bottom sheet but not for a side sheet', () => {
    const withKeyboard = { ...baseInput, keyboardHeight: 300 };
    expect(
      resolveOverlayFrame({ ...withKeyboard, placement: 'bottomSheet' }).region
        .height,
    ).toBe(468);
    expect(
      resolveOverlayFrame({ ...withKeyboard, placement: 'sideSheet' }).region
        .height,
    ).toBe(768);
  });

  it('centres a dialog within the safe area when the side insets are uneven', () => {
    const frame = resolveOverlayFrame({
      ...baseInput,
      windowSize: { width: 475, height: 669 },
      safeAreaInsets: { top: 24, right: 0, bottom: 20, left: 84 },
    });
    expect(frame.region).toEqual({ x: 84, y: 24, width: 391, height: 625 });
    expect(frame.surfaceMaxWidth).toBe(391 - 48);
    expect(frame.surfaceMaxHeight).toBe(625 - 48);
  });

  it('pads a full-screen overlay by every safe-area inset', () => {
    const insets = { top: 32, right: 0, bottom: 24, left: 0 };
    expect(
      resolveOverlayFrame({
        ...baseInput,
        placement: 'fullscreen',
        safeAreaInsets: insets,
      }).contentInsets,
    ).toEqual(insets);
  });

  it('drops the bottom inset while the keyboard covers it', () => {
    expect(
      resolveOverlayFrame({
        ...baseInput,
        placement: 'bottomSheet',
        safeAreaInsets: { top: 32, right: 0, bottom: 24, left: 0 },
        keyboardHeight: 300,
      }).contentInsets.bottom,
    ).toBe(0);
  });
});

describe('resolveModalPlacement', () => {
  it.each([
    ['compact', 'medium', 'fullscreen'],
    ['medium', 'medium', 'dialog'],
    ['xlarge', 'expanded', 'dialog'],
    ['expanded', 'compact', 'fullscreen'],
  ] as const)(
    'is %p wide and %p tall -> %p',
    (widthClass, heightClass, expected) => {
      expect(
        resolveModalPlacement(
          DEFAULT_MODAL_PRESENTATION,
          widthClass,
          heightClass,
        ),
      ).toBe(expected);
    },
  );
});

describe('resolveSheetPlacement', () => {
  it('is a bottom sheet on compact and a side sheet from medium', () => {
    expect(resolveSheetPlacement(DEFAULT_SHEET_PRESENTATION, 'compact')).toBe(
      'bottomSheet',
    );
    expect(resolveSheetPlacement(DEFAULT_SHEET_PRESENTATION, 'medium')).toBe(
      'sideSheet',
    );
  });
});
