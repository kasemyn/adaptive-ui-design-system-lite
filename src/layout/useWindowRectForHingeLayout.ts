import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { HostViewInstance, HostViewRef } from '../hostViewInstance';
import type { HingeFeature, WindowRect } from '../responsive/foldPosture';
import { shallowEqual } from '../responsive/shallowEqual';

/**
 * Hinge bounds are in window coordinates, so a layout that splits around the hinge needs its own position
 * in the window (e.g. offset by a navigation rail). Only measures while the display reports a hinge or fold, which
 * keeps continuous desktop-window resizes free of per-frame measurement.
 */
type WindowRectForHingeLayout = {
  containerRef: HostViewRef;
  containerRectInWindow: WindowRect | null;
  onContainerLayout: () => void;
};

export function useWindowRectForHingeLayout(
  hinge: HingeFeature | null,
): WindowRectForHingeLayout {
  const containerRef = useRef<HostViewInstance | null>(null);
  const [containerRectInWindow, setContainerRectInWindow] =
    useState<WindowRect | null>(null);
  const shouldMeasure = hinge !== null;

  const measureContainer = useCallback(() => {
    if (!shouldMeasure) {
      return;
    }
    containerRef.current?.measureInWindow((x, y, width, height) => {
      const measured = { x, y, width, height };
      setContainerRectInWindow(previous =>
        previous && shallowEqual(previous, measured) ? previous : measured,
      );
    });
  }, [shouldMeasure]);

  useLayoutEffect(measureContainer, [measureContainer, hinge]);

  return {
    containerRef,
    containerRectInWindow: shouldMeasure ? containerRectInWindow : null,
    onContainerLayout: measureContainer,
  };
}
