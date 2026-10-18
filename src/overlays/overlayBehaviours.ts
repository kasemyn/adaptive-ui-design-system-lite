import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Easing,
  Keyboard,
  Platform,
} from 'react-native';
import type { HostViewInstance, HostViewRef } from '../hostViewInstance';

const ENTER_DURATION_MS = 220;
const EXIT_DURATION_MS = 180;

/**
 * Keeps the overlay mounted through its exit animation. `presenceProgress` runs 0 → 1 on open and 1 → 0 on close.
 */
export function useOverlayPresence(visible: boolean) {
  const [isMounted, setIsMounted] = useState(visible);
  const presenceProgress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
    }
    const animation = Animated.timing(presenceProgress, {
      toValue: visible ? 1 : 0,
      duration: visible ? ENTER_DURATION_MS : EXIT_DURATION_MS,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) {
        setIsMounted(false);
      }
    });
    return () => animation.stop();
  }, [visible, presenceProgress]);

  return { isMounted, presenceProgress };
}

export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, event =>
      setKeyboardHeight(event.endCoordinates.height),
    );
    const hideSubscription = Keyboard.addListener(hideEvent, () =>
      setKeyboardHeight(0),
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardHeight;
}

export function useCloseOnAndroidBack(
  isOpen: boolean,
  onRequestClose: () => void,
) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onRequestClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isOpen, onRequestClose]);
}

/**
 * Moves screen-reader focus to the overlay surface once it has laid out. Portal content mounts after the
 * owning component's effects run, so a plain effect would find no surface to focus.
 */
export function useAccessibilityFocusOnFirstLayout(isOpen: boolean): {
  surfaceRef: HostViewRef;
  onSurfaceLayout: () => void;
} {
  const surfaceRef = useRef<HostViewInstance | null>(null);
  const hasFocusedSurfaceRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      hasFocusedSurfaceRef.current = false;
    }
  }, [isOpen]);

  const onSurfaceLayout = useCallback(() => {
    if (!isOpen || hasFocusedSurfaceRef.current || !surfaceRef.current) {
      return;
    }
    hasFocusedSurfaceRef.current = true;
    AccessibilityInfo.sendAccessibilityEvent(surfaceRef.current, 'focus');
  }, [isOpen]);

  return { surfaceRef, onSurfaceLayout };
}
