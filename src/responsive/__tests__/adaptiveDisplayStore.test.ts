import { createAdaptiveDisplayStore } from '../adaptiveDisplayStore';
import type { FoldingFeature } from '../foldPosture';
import { NO_INSETS } from '../hingeInsets';

const bookPostureFold: FoldingFeature = {
  x: 345,
  y: 0,
  width: 0,
  height: 829,
  state: 'halfOpened',
  orientation: 'vertical',
  isSeparating: true,
  occlusionType: 'none',
};

const folded = { width: 344, height: 882 };
const unfolded = { width: 690, height: 829 };

function createFoldedStore() {
  return createAdaptiveDisplayStore({
    windowSize: folded,
    safeAreaInsets: NO_INSETS,
    foldingFeature: null,
  });
}

describe('createAdaptiveDisplayStore', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('derives size classes from the initial window', () => {
    const store = createFoldedStore();
    expect(store.getSnapshot()).toMatchObject({
      widthClass: 'compact',
      heightClass: 'medium',
      posture: 'flat',
      hinge: null,
    });
  });

  it('keeps snapshot identity and does not notify when nothing changed', () => {
    const store = createFoldedStore();
    const listener = jest.fn();
    store.subscribe(listener);
    const before = store.getSnapshot();

    store.setWindowSize({ ...folded });

    expect(store.getSnapshot()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
  });

  it('applies a fold report immediately when it matches the current window', () => {
    const store = createFoldedStore();
    store.setWindowSize(unfolded);

    store.reportWindowLayout({
      windowSize: unfolded,
      foldingFeatures: [bookPostureFold],
    });

    expect(store.getSnapshot()).toMatchObject({
      widthClass: 'medium',
      posture: 'book',
    });
  });

  it('holds a fold report that arrives before the resize, then applies it on resize', () => {
    const store = createFoldedStore();

    store.reportWindowLayout({
      windowSize: unfolded,
      foldingFeatures: [bookPostureFold],
    });
    expect(store.getSnapshot().posture).toBe('flat');

    store.setWindowSize(unfolded);
    expect(store.getSnapshot().posture).toBe('book');
  });

  it('applies a held fold report after a timeout if the window size never matches', () => {
    const store = createFoldedStore();
    store.setWindowSize({ width: 680, height: 829 });

    store.reportWindowLayout({
      windowSize: unfolded,
      foldingFeatures: [bookPostureFold],
    });
    expect(store.getSnapshot().posture).toBe('flat');

    jest.advanceTimersByTime(150);
    expect(store.getSnapshot().posture).toBe('book');
  });

  it('notifies subscribers once per effective change', () => {
    const store = createFoldedStore();
    const listener = jest.fn();
    store.subscribe(listener);

    store.setWindowSize(unfolded);
    store.setSafeAreaInsets({ ...NO_INSETS, top: 24 });

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('stops notifying after unsubscribe', () => {
    const store = createFoldedStore();
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.setWindowSize(unfolded);

    expect(listener).not.toHaveBeenCalled();
  });
});
