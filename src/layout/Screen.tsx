import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useAdaptiveSafeAreaInsets } from '../responsive/adaptiveDisplayHooks';
import type { ResponsiveValue } from '../responsive/responsiveValue';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import type { ColorToken, SpacingToken } from '../theme/tokens';
import { useConsumedSafeAreaEdges } from './ConsumedSafeAreaEdges';
import { Container, type ContainerWidth } from './Container';

type ScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  contentWidth?: ContainerWidth;
  padding?: ResponsiveValue<SpacingToken>;
  background?: ColorToken;
  testID?: string;
};

const DEFAULT_SCREEN_PADDING: ResponsiveValue<SpacingToken> = {
  compact: 'lg',
  medium: 'xl',
  expanded: 'xxl',
};

/**
 * One screen: safe area (minus edges that navigation chrome already covers), keyboard avoidance,
 * optional scrolling, and a readable max content width. Replaces the SafeAreaView + KeyboardAvoidingView +
 * ScrollView stack.
 */
export function Screen({
  children,
  scrollable = true,
  contentWidth = 'content',
  padding = DEFAULT_SCREEN_PADDING,
  background = 'background',
  testID,
}: ScreenProps) {
  const theme = useAdaptiveTheme();
  const safeAreaInsets = useAdaptiveSafeAreaInsets();
  const consumedEdges = useConsumedSafeAreaEdges();

  const safeAreaPadding: ViewStyle = {
    paddingTop: consumedEdges.includes('top') ? 0 : safeAreaInsets.top,
    paddingRight: consumedEdges.includes('right') ? 0 : safeAreaInsets.right,
    paddingBottom: consumedEdges.includes('bottom') ? 0 : safeAreaInsets.bottom,
    paddingLeft: consumedEdges.includes('left') ? 0 : safeAreaInsets.left,
  };

  const content = (
    <Container
      contentWidth={contentWidth}
      padding={padding}
      gap="lg"
      flex={scrollable ? undefined : 1}
    >
      {children}
    </Container>
  );

  // Safe-area padding sits outside the KeyboardAvoidingView: in `padding` mode it owns paddingBottom and
  // would overwrite the bottom inset.
  return (
    <View
      testID={testID}
      style={[
        styles.fill,
        safeAreaPadding,
        { backgroundColor: theme.colors[background] },
      ]}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.fill}>
        {scrollable ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {content}
          </ScrollView>
        ) : (
          <View style={styles.fill}>{content}</View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
