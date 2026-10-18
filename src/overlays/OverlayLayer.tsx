import type { ReactNode } from 'react';
import {
  Animated,
  I18nManager,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import type { HostViewRef } from '../hostViewInstance';
import {
  useAdaptiveSafeAreaInsets,
  useAdaptiveWindowSize,
  useFoldingFeature,
} from '../responsive/adaptiveDisplayHooks';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import type { AdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import { useKeyboardHeight } from './overlayBehaviours';
import {
  resolveOverlayFrame,
  type OverlayFrame,
  type OverlayPlacement,
} from './overlayFrame';
import { OverlayPortal } from './OverlayHost';

type OverlayLayerProps = {
  placement: OverlayPlacement;
  presenceProgress: Animated.Value;
  dragOffset?: Animated.Value;
  onScrimPress: () => void;
  accessibilityLabel: string;
  surfaceRef?: HostViewRef;
  onSurfaceLayout?: () => void;
  dialogMaxWidth?: number;
  children: ReactNode;
};

const SIDE_SHEET_WIDTH_DP = 360;
const BOTTOM_SHEET_MAX_WIDTH_DP = 640;
const DEFAULT_DIALOG_MAX_WIDTH_DP = 560;

function toRegionStyle(frame: OverlayFrame): ViewStyle {
  const position: ViewStyle = {
    position: 'absolute',
    left: frame.region.x,
    top: frame.region.y,
    width: frame.region.width,
    height: frame.region.height,
  };
  switch (frame.alignment) {
    case 'fill':
      return position;
    case 'center':
      return { ...position, justifyContent: 'center', alignItems: 'center' };
    case 'bottom':
      return { ...position, justifyContent: 'flex-end', alignItems: 'center' };
    case 'end':
      return { ...position, flexDirection: 'row', justifyContent: 'flex-end' };
  }
}

function toSurfaceStyle(
  placement: OverlayPlacement,
  frame: OverlayFrame,
  theme: AdaptiveTheme,
): ViewStyle {
  const surface: ViewStyle = {
    backgroundColor: theme.colors.surfaceRaised,
    paddingTop: frame.contentInsets.top,
    paddingRight: frame.contentInsets.right,
    paddingBottom: frame.contentInsets.bottom,
    paddingLeft: frame.contentInsets.left,
    overflow: 'hidden',
  };
  switch (placement) {
    case 'fullscreen':
      return { ...surface, flex: 1 };
    case 'dialog':
      return {
        ...surface,
        width: '100%',
        maxWidth: frame.surfaceMaxWidth,
        maxHeight: frame.surfaceMaxHeight,
        borderRadius: theme.radii.xl,
      };
    case 'bottomSheet':
      return {
        ...surface,
        width: '100%',
        maxWidth: frame.surfaceMaxWidth,
        maxHeight: frame.surfaceMaxHeight,
        borderTopStartRadius: theme.radii.xl,
        borderTopEndRadius: theme.radii.xl,
      };
    case 'sideSheet':
      return {
        ...surface,
        width: frame.surfaceMaxWidth,
        height: '100%',
        borderTopStartRadius: theme.radii.xl,
        borderBottomStartRadius: theme.radii.xl,
      };
  }
}

function toSurfaceAnimation(
  placement: OverlayPlacement,
  frame: OverlayFrame,
  presenceProgress: Animated.Value,
  dragOffset: Animated.Value | undefined,
  isRTL: boolean,
) {
  if (placement === 'dialog') {
    return {
      opacity: presenceProgress,
      transform: [
        {
          scale: presenceProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1],
          }),
        },
      ],
    };
  }
  if (placement === 'sideSheet') {
    const offscreenX = isRTL ? -frame.surfaceMaxWidth : frame.surfaceMaxWidth;
    return {
      transform: [
        {
          translateX: presenceProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [offscreenX, 0],
          }),
        },
      ],
    };
  }
  const slideInY = presenceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [frame.region.height, 0],
  });
  return {
    transform: [
      {
        translateY: dragOffset ? Animated.add(slideInY, dragOffset) : slideInY,
      },
    ],
  };
}

/**
 * Scrim + positioned, animated surface shared by `AdaptiveModal` and `AdaptiveSheet`.
 * The element tree is identical for every placement, so a placement change while open (unfold, resize)
 * only restyles the surface and never remounts `children`.
 */
export function OverlayLayer({
  placement,
  presenceProgress,
  dragOffset,
  onScrimPress,
  accessibilityLabel,
  surfaceRef,
  onSurfaceLayout,
  dialogMaxWidth = DEFAULT_DIALOG_MAX_WIDTH_DP,
  children,
}: OverlayLayerProps) {
  const theme = useAdaptiveTheme();
  const windowSize = useAdaptiveWindowSize();
  const safeAreaInsets = useAdaptiveSafeAreaInsets();
  const { hinge } = useFoldingFeature();
  const keyboardHeight = useKeyboardHeight();
  const isRTL = I18nManager.isRTL;

  const frame = resolveOverlayFrame({
    placement,
    windowSize,
    safeAreaInsets,
    hinge,
    keyboardHeight,
    isRTL,
    dialogMaxWidth,
    sideSheetWidth: SIDE_SHEET_WIDTH_DP,
    bottomSheetMaxWidth: BOTTOM_SHEET_MAX_WIDTH_DP,
  });

  return (
    <OverlayPortal>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.scrim, opacity: presenceProgress },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onScrimPress}
            accessibilityRole="button"
            accessibilityLabel="Close"
            importantForAccessibility="no"
            accessibilityElementsHidden
          />
        </Animated.View>
        <View style={toRegionStyle(frame)} pointerEvents="box-none">
          <Animated.View
            ref={surfaceRef}
            onLayout={onSurfaceLayout}
            accessibilityViewIsModal
            accessibilityLabel={accessibilityLabel}
            role="dialog"
            style={[
              toSurfaceStyle(placement, frame, theme),
              toSurfaceAnimation(
                placement,
                frame,
                presenceProgress,
                dragOffset,
                isRTL,
              ),
            ]}
          >
            {children}
          </Animated.View>
        </View>
      </View>
    </OverlayPortal>
  );
}
