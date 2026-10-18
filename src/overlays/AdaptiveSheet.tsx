import { useMemo, useRef, type ReactNode } from 'react';
import {
  Animated,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { useWindowWidthClass } from '../responsive/adaptiveDisplayHooks';
import type { ResponsiveValue } from '../responsive/responsiveValue';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import {
  useAccessibilityFocusOnFirstLayout,
  useCloseOnAndroidBack,
  useOverlayPresence,
} from './overlayBehaviours';
import { OverlayLayer } from './OverlayLayer';
import {
  DEFAULT_SHEET_PRESENTATION,
  resolveSheetPlacement,
  type SheetPresentation,
} from './overlayPlacement';

type AdaptiveSheetProps = {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  children: ReactNode;
  /** Defaults to a bottom sheet on compact windows and a side sheet from medium up. */
  presentation?: ResponsiveValue<SheetPresentation>;
};

const DRAG_DISTANCE_TO_DISMISS_DP = 120;
const DRAG_VELOCITY_TO_DISMISS = 1;

function useDragToDismiss(onDismiss: () => void) {
  const dragOffset = useRef(new Animated.Value(0)).current;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4,
        onPanResponderMove: (_, gesture) =>
          dragOffset.setValue(Math.max(0, gesture.dy)),
        onPanResponderRelease: (_, gesture) => {
          const shouldDismiss =
            gesture.dy > DRAG_DISTANCE_TO_DISMISS_DP ||
            gesture.vy > DRAG_VELOCITY_TO_DISMISS;
          if (shouldDismiss) {
            onDismissRef.current();
          }
          Animated.spring(dragOffset, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [dragOffset],
  );

  return { dragOffset, dragHandlers: panResponder.panHandlers };
}

/**
 * Bottom sheet on phones, side sheet on larger windows. Switches while open (e.g. on unfold)
 * without remounting its content. A bottom sheet can be dragged down by its handle to dismiss.
 */
export function AdaptiveSheet({
  visible,
  onRequestClose,
  title,
  children,
  presentation = DEFAULT_SHEET_PRESENTATION,
}: AdaptiveSheetProps) {
  const theme = useAdaptiveTheme();
  const widthClass = useWindowWidthClass();
  const { isMounted, presenceProgress } = useOverlayPresence(visible);
  const { surfaceRef, onSurfaceLayout } =
    useAccessibilityFocusOnFirstLayout(visible);
  const { dragOffset, dragHandlers } = useDragToDismiss(onRequestClose);
  useCloseOnAndroidBack(visible, onRequestClose);

  if (!isMounted) {
    return null;
  }

  const placement = resolveSheetPlacement(presentation, widthClass);
  const isBottomSheet = placement === 'bottomSheet';

  return (
    <OverlayLayer
      placement={placement}
      presenceProgress={presenceProgress}
      dragOffset={dragOffset}
      onScrimPress={onRequestClose}
      accessibilityLabel={title}
      surfaceRef={surfaceRef}
      onSurfaceLayout={onSurfaceLayout}
    >
      <View
        {...(isBottomSheet ? dragHandlers : {})}
        style={styles.header}
        accessibilityHint={isBottomSheet ? 'Drag down to close' : undefined}
      >
        <View
          style={[
            styles.dragHandle,
            { backgroundColor: theme.colors.border },
            !isBottomSheet && styles.invisible,
          ]}
        />
        <Box paddingX="xl" paddingTop="sm">
          <Text variant="headingSm" role="heading">
            {title}
          </Text>
        </Box>
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={{
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </OverlayLayer>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 8 },
  dragHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  invisible: { opacity: 0 },
  body: { flexShrink: 1 },
});
