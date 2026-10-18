import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Box, HStack } from '../primitives/Box';
import { Divider } from '../primitives/Divider';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { useWindowSizeClass } from '../responsive/adaptiveDisplayHooks';
import type { ResponsiveValue } from '../responsive/responsiveValue';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import { MINIMUM_TOUCH_TARGET_DP } from '../theme/tokens';
import {
  useAccessibilityFocusOnFirstLayout,
  useCloseOnAndroidBack,
  useOverlayPresence,
} from './overlayBehaviours';
import { OverlayLayer } from './OverlayLayer';
import {
  DEFAULT_MODAL_PRESENTATION,
  resolveModalPlacement,
  type ModalPresentation,
} from './overlayPlacement';

type AdaptiveModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Defaults to full screen on compact windows and a centred dialog from medium up. */
  presentation?: ResponsiveValue<ModalPresentation>;
  dialogMaxWidth?: number;
};

/**
 * Full-screen on phones, a centred dialog on larger windows, and never across a separating hinge.
 * Switches presentation while open (e.g. on unfold) without remounting its content.
 */
export function AdaptiveModal({
  visible,
  onRequestClose,
  title,
  children,
  footer,
  presentation = DEFAULT_MODAL_PRESENTATION,
  dialogMaxWidth,
}: AdaptiveModalProps) {
  const { widthClass, heightClass } = useWindowSizeClass();
  const { isMounted, presenceProgress } = useOverlayPresence(visible);
  const theme = useAdaptiveTheme();
  const { surfaceRef, onSurfaceLayout } =
    useAccessibilityFocusOnFirstLayout(visible);
  useCloseOnAndroidBack(visible, onRequestClose);

  if (!isMounted) {
    return null;
  }

  const placement = resolveModalPlacement(
    presentation,
    widthClass,
    heightClass,
  );

  return (
    <OverlayLayer
      placement={placement}
      presenceProgress={presenceProgress}
      onScrimPress={onRequestClose}
      accessibilityLabel={title}
      surfaceRef={surfaceRef}
      onSurfaceLayout={onSurfaceLayout}
      dialogMaxWidth={dialogMaxWidth}
    >
      <HStack paddingStart="xl" paddingEnd="sm" paddingY="sm" gap="sm">
        <View style={styles.title}>
          <Text variant="headingSm" role="heading" numberOfLines={2}>
            {title}
          </Text>
        </View>
        <Pressable
          onPress={onRequestClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.closeButton}
        >
          <Text variant="headingSm" color="textSecondary">
            ✕
          </Text>
        </Pressable>
      </HStack>
      <Divider />
      <ScrollView
        style={placement === 'fullscreen' ? styles.fill : styles.shrink}
        contentContainerStyle={{
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer && (
        <>
          <Divider />
          <Box padding="lg" direction="row" justify="flex-end" gap="sm">
            {footer}
          </Box>
        </>
      )}
    </OverlayLayer>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  shrink: { flexShrink: 1 },
  title: { flex: 1 },
  closeButton: {
    width: MINIMUM_TOUCH_TARGET_DP,
    height: MINIMUM_TOUCH_TARGET_DP,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MINIMUM_TOUCH_TARGET_DP / 2,
  },
});
