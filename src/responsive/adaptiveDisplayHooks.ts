import { useCallback, useRef, useSyncExternalStore } from 'react';
import type { EdgeInsets } from 'react-native-safe-area-context';
import type { AdaptiveDisplaySnapshot } from './adaptiveDisplaySnapshot';
import { useAdaptiveDisplayStore } from './AdaptiveDisplayProvider';
import type { FoldPosture, HingeFeature } from './foldPosture';
import { hingeToInsets, type HingeRegion } from './hingeInsets';
import {
  resolveResponsiveValue,
  type ResponsiveValue,
  type ResponsiveValueByWidthClass,
} from './responsiveValue';
import { shallowEqual } from './shallowEqual';
import {
  isWindowWidthAtLeast,
  type WindowHeightClass,
  type WindowOrientation,
  type WindowSize,
  type WindowWidthClass,
} from './windowSizeClass';

type LastSelection<T> = {
  snapshot: AdaptiveDisplaySnapshot;
  selector: (snapshot: AdaptiveDisplaySnapshot) => T;
  value: T;
};

/**
 * Re-renders only when the selected value changes, not on every window resize.
 * Prefer the narrower hooks below; reach for this only for a derived value they don't cover.
 */
export function useAdaptiveDisplaySelector<T>(
  selector: (snapshot: AdaptiveDisplaySnapshot) => T,
  isEqual: (previous: T, next: T) => boolean = Object.is,
): T {
  const store = useAdaptiveDisplayStore();
  const lastSelection = useRef<LastSelection<T> | null>(null);

  const getSelection = () => {
    const snapshot = store.getSnapshot();
    const last = lastSelection.current;
    if (last && last.snapshot === snapshot && last.selector === selector) {
      return last.value;
    }
    const value = selector(snapshot);
    const valueToKeep = last && isEqual(last.value, value) ? last.value : value;
    lastSelection.current = { snapshot, selector, value: valueToKeep };
    return valueToKeep;
  };

  return useSyncExternalStore(store.subscribe, getSelection);
}

type WindowSizeClass = {
  widthClass: WindowWidthClass;
  heightClass: WindowHeightClass;
  orientation: WindowOrientation;
};

const selectWindowSizeClass = (
  snapshot: AdaptiveDisplaySnapshot,
): WindowSizeClass => ({
  widthClass: snapshot.widthClass,
  heightClass: snapshot.heightClass,
  orientation: snapshot.orientation,
});

/** Coarse window size. The default choice: re-renders only when a size class changes. */
export function useWindowSizeClass(): WindowSizeClass {
  return useAdaptiveDisplaySelector(selectWindowSizeClass, shallowEqual);
}

const selectWindowSize = (snapshot: AdaptiveDisplaySnapshot) =>
  snapshot.windowSize;

/** Raw window size in dp. Re-renders on every frame of a desktop-window drag; use sparingly. */
export function useAdaptiveWindowSize(): WindowSize {
  return useAdaptiveDisplaySelector(selectWindowSize, shallowEqual);
}

type FoldingFeatureState = {
  posture: FoldPosture;
  hinge: HingeFeature | null;
};

const selectFoldingFeature = (
  snapshot: AdaptiveDisplaySnapshot,
): FoldingFeatureState => ({
  posture: snapshot.posture,
  hinge: snapshot.hinge,
});

export function useFoldingFeature(): FoldingFeatureState {
  return useAdaptiveDisplaySelector(selectFoldingFeature, shallowEqual);
}

const selectSafeAreaInsets = (snapshot: AdaptiveDisplaySnapshot) =>
  snapshot.safeAreaInsets;

export function useAdaptiveSafeAreaInsets(): EdgeInsets {
  return useAdaptiveDisplaySelector(selectSafeAreaInsets, shallowEqual);
}

export function useHingeInsets(region: HingeRegion): EdgeInsets {
  return useAdaptiveDisplaySelector(
    snapshot => hingeToInsets(snapshot.hinge, snapshot.windowSize, region),
    shallowEqual,
  );
}

const selectWidthClass = (snapshot: AdaptiveDisplaySnapshot) =>
  snapshot.widthClass;

export function useWindowWidthClass(): WindowWidthClass {
  return useAdaptiveDisplaySelector(selectWidthClass);
}

/**
 * The value for the current width class, cascading mobile-first. Always defined when a `compact` value (or a
 * plain value) is given; otherwise `undefined` below the smallest class that has one.
 */
export function useResponsiveValue<T>(
  value: ResponsiveValueByWidthClass<T> & { compact: T },
): T;
export function useResponsiveValue<T extends string | number | boolean>(
  value: T,
): T;
export function useResponsiveValue<T>(value: ResponsiveValue<T>): T | undefined;
export function useResponsiveValue<T>(
  value: ResponsiveValue<T>,
): T | undefined {
  return resolveResponsiveValue(value, useWindowWidthClass());
}

export type AdaptiveLayout = {
  widthClass: WindowWidthClass;
  heightClass: WindowHeightClass;
  orientation: WindowOrientation;
  posture: FoldPosture;
  hinge: HingeFeature | null;
  /** `isAtLeast('medium')` — true on medium, expanded, large and xlarge windows. */
  isAtLeast: (minimumWidthClass: WindowWidthClass) => boolean;
};

type AdaptiveLayoutSelection = Omit<AdaptiveLayout, 'isAtLeast'>;

const selectAdaptiveLayout = (
  snapshot: AdaptiveDisplaySnapshot,
): AdaptiveLayoutSelection => ({
  widthClass: snapshot.widthClass,
  heightClass: snapshot.heightClass,
  orientation: snapshot.orientation,
  posture: snapshot.posture,
  hinge: snapshot.hinge,
});

/**
 * The one hook to start with: size classes, orientation and fold posture together. Re-renders only when one of
 * them changes, never per pixel while a desktop window is dragged. Reach for the narrower hooks only when a
 * component cares about a single value.
 */
export function useAdaptiveLayout(): AdaptiveLayout {
  const layout = useAdaptiveDisplaySelector(selectAdaptiveLayout, shallowEqual);
  const isAtLeast = useCallback(
    (minimumWidthClass: WindowWidthClass) =>
      isWindowWidthAtLeast(layout.widthClass, minimumWidthClass),
    [layout.widthClass],
  );
  return { ...layout, isAtLeast };
}
