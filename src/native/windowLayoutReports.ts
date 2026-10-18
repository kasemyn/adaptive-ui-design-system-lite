import { Platform } from 'react-native';
import type {
  FoldingFeature,
  WindowLayoutReport,
} from '../responsive/foldPosture';
import NativeAdaptiveFold, {
  type NativeFoldingFeature,
  type NativeWindowLayout,
} from './NativeAdaptiveFold';

function toFoldingFeature(native: NativeFoldingFeature): FoldingFeature {
  return {
    x: native.x,
    y: native.y,
    width: native.width,
    height: native.height,
    state: native.state === 'halfOpened' ? 'halfOpened' : 'flat',
    orientation: native.orientation === 'vertical' ? 'vertical' : 'horizontal',
    isSeparating: native.isSeparating,
    occlusionType: native.occlusionType === 'full' ? 'full' : 'none',
  };
}

export function toWindowLayoutReport(
  native: NativeWindowLayout,
): WindowLayoutReport {
  return {
    windowSize: { width: native.windowWidth, height: native.windowHeight },
    foldingFeatures: native.foldingFeatures.map(toFoldingFeature),
  };
}

let hasWarnedAboutMissingFoldModule = false;

/**
 * Without the native module the app still works, but reports every fold as `flat`. On Android that means the
 * New Architecture is off or the app wasn't rebuilt after installing the package, so say so once in development.
 */
export function warnIfFoldModuleMissingInDevelopment() {
  if (
    !__DEV__ ||
    NativeAdaptiveFold ||
    Platform.OS !== 'android' ||
    hasWarnedAboutMissingFoldModule
  ) {
    return;
  }
  hasWarnedAboutMissingFoldModule = true;
  console.warn(
    '@fc/adaptive-ui: the AdaptiveFold native module is not linked, so hinge and fold posture are unavailable. ' +
      'Rebuild the Android app, and check the New Architecture is enabled (npx adaptive-ui doctor).',
  );
}

export function readCurrentWindowLayoutReport(): WindowLayoutReport | null {
  const native = NativeAdaptiveFold?.getCurrentWindowLayout();
  return native ? toWindowLayoutReport(native) : null;
}

export function subscribeToWindowLayoutReports(
  listener: (report: WindowLayoutReport) => void,
): () => void {
  if (!NativeAdaptiveFold) {
    return () => {};
  }
  const subscription = NativeAdaptiveFold.onWindowLayoutChange(native =>
    listener(toWindowLayoutReport(native)),
  );
  return () => subscription.remove();
}
