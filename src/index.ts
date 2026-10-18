export { AdaptiveProvider } from './AdaptiveProvider';
export { AdaptiveDebugBadge } from './devtools/AdaptiveDebugBadge';

export {
  useAdaptiveLayout,
  type AdaptiveLayout,
  useAdaptiveDisplaySelector,
  useAdaptiveSafeAreaInsets,
  useAdaptiveWindowSize,
  useFoldingFeature,
  useHingeInsets,
  useResponsiveValue,
  useWindowSizeClass,
  useWindowWidthClass,
} from './responsive/adaptiveDisplayHooks';
export type { AdaptiveDisplaySnapshot } from './responsive/adaptiveDisplaySnapshot';
export type {
  FoldingFeature,
  FoldPosture,
  HingeFeature,
  HingeOrientation,
  WindowRect,
} from './responsive/foldPosture';
export { hingeToInsets, type HingeRegion } from './responsive/hingeInsets';
export {
  resolveResponsiveValue,
  type ResponsiveValue,
} from './responsive/responsiveValue';
export {
  classifyWindowHeight,
  classifyWindowWidth,
  isWindowWidthAtLeast,
  type WindowHeightClass,
  type WindowOrientation,
  type WindowSize,
  type WindowWidthClass,
} from './responsive/windowSizeClass';

export {
  useAdaptiveTheme,
  type AdaptiveTheme,
  type AdaptiveThemeOverrides,
} from './theme/AdaptiveThemeProvider';
export type {
  ColorToken,
  ContentMaxWidthToken,
  RadiusToken,
  SpacingToken,
  TypographyVariant,
} from './theme/tokens';

export {
  Box,
  HStack,
  VStack,
  type BoxProps,
  type StackProps,
} from './primitives/Box';
export { Button, type ButtonVariant } from './primitives/Button';
export { Divider } from './primitives/Divider';
export { Icon } from './primitives/Icon';
export {
  Pressable,
  type AdaptivePressableState,
  type PressableProps,
} from './primitives/Pressable';
export { Spacer } from './primitives/Spacer';
export { Text, type TextProps } from './primitives/Text';

export {
  ConsumedSafeAreaEdgesProvider,
  useConsumedSafeAreaEdges,
  type SafeAreaEdge,
} from './layout/ConsumedSafeAreaEdges';
export { Container, type ContainerWidth } from './layout/Container';
export { Grid } from './layout/Grid';
export { HingeGutter } from './layout/HingeGutter';
export { useLayoutPersistentState } from './layout/LayoutPersistentState';
export { Screen } from './layout/Screen';
export { TwoPane, useTwoPaneArrangement } from './layout/TwoPane';
export type { TwoPaneArrangement } from './layout/twoPaneLayout';

export { AdaptiveModal } from './overlays/AdaptiveModal';
export { AdaptiveSheet } from './overlays/AdaptiveSheet';
export type {
  ModalPresentation,
  SheetPresentation,
} from './overlays/overlayPlacement';
