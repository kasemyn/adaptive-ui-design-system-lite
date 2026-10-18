import type { EdgeInsets } from 'react-native-safe-area-context';
import {
  deriveAdaptiveDisplaySnapshot,
  type AdaptiveDisplayInputs,
  type AdaptiveDisplaySnapshot,
} from './adaptiveDisplaySnapshot';
import {
  findFoldingFeatureInsideWindow,
  type FoldingFeature,
  type WindowLayoutReport,
} from './foldPosture';
import { shallowEqual } from './shallowEqual';
import type { WindowSize } from './windowSizeClass';

export type AdaptiveDisplayStore = {
  getSnapshot(): AdaptiveDisplaySnapshot;
  subscribe(listener: () => void): () => void;
  setWindowSize(windowSize: WindowSize): void;
  setSafeAreaInsets(safeAreaInsets: EdgeInsets): void;
  reportWindowLayout(report: WindowLayoutReport): void;
  dispose(): void;
};

const WINDOW_SIZE_MATCH_TOLERANCE_DP = 1;
const PENDING_WINDOW_LAYOUT_TIMEOUT_MS = 150;

export function createAdaptiveDisplayStore(
  initialInputs: AdaptiveDisplayInputs,
): AdaptiveDisplayStore {
  let inputs = initialInputs;
  let snapshot = deriveAdaptiveDisplaySnapshot(inputs);
  let pendingWindowLayoutReport: WindowLayoutReport | null = null;
  let pendingWindowLayoutTimer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  function updateInputs(nextInputs: AdaptiveDisplayInputs) {
    const inputsUnchanged =
      shallowEqual(nextInputs.windowSize, inputs.windowSize) &&
      shallowEqual(nextInputs.safeAreaInsets, inputs.safeAreaInsets) &&
      shallowEqual(nextInputs.foldingFeature, inputs.foldingFeature);
    if (inputsUnchanged) {
      return;
    }
    inputs = nextInputs;
    snapshot = deriveAdaptiveDisplaySnapshot(inputs);
    listeners.forEach(listener => listener());
  }

  function clearPendingWindowLayout() {
    pendingWindowLayoutReport = null;
    if (pendingWindowLayoutTimer) {
      clearTimeout(pendingWindowLayoutTimer);
      pendingWindowLayoutTimer = null;
    }
  }

  function applyWindowLayoutReport(report: WindowLayoutReport) {
    clearPendingWindowLayout();
    const foldingFeature: FoldingFeature | null =
      findFoldingFeatureInsideWindow({
        windowSize: inputs.windowSize,
        foldingFeatures: report.foldingFeatures,
      });
    updateInputs({ ...inputs, foldingFeature });
  }

  function reportMatchesCurrentWindow(report: WindowLayoutReport) {
    return (
      Math.abs(report.windowSize.width - inputs.windowSize.width) <=
        WINDOW_SIZE_MATCH_TOLERANCE_DP &&
      Math.abs(report.windowSize.height - inputs.windowSize.height) <=
        WINDOW_SIZE_MATCH_TOLERANCE_DP
    );
  }

  return {
    getSnapshot: () => snapshot,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setWindowSize(windowSize) {
      updateInputs({ ...inputs, windowSize });
      if (
        pendingWindowLayoutReport &&
        reportMatchesCurrentWindow(pendingWindowLayoutReport)
      ) {
        applyWindowLayoutReport(pendingWindowLayoutReport);
      }
    },

    setSafeAreaInsets(safeAreaInsets) {
      updateInputs({ ...inputs, safeAreaInsets });
    },

    // Fold reports and root-view resizes arrive separately and in either order when a device unfolds.
    // Holding a report until the window size matches avoids a frame of "wide layout, no hinge" or a hinge outside the window.
    reportWindowLayout(report) {
      if (reportMatchesCurrentWindow(report)) {
        applyWindowLayoutReport(report);
        return;
      }
      clearPendingWindowLayout();
      pendingWindowLayoutReport = report;
      pendingWindowLayoutTimer = setTimeout(
        () => applyWindowLayoutReport(report),
        PENDING_WINDOW_LAYOUT_TIMEOUT_MS,
      );
    },

    dispose() {
      clearPendingWindowLayout();
      listeners.clear();
    },
  };
}
