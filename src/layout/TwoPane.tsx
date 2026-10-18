import { createContext, useContext, useEffect, type ReactNode } from 'react';
import {
  BackHandler,
  I18nManager,
  StyleSheet,
  View,
  type DimensionValue,
  type ViewStyle,
} from 'react-native';
import {
  useFoldingFeature,
  useWindowSizeClass,
} from '../responsive/adaptiveDisplayHooks';
import {
  resolveResponsiveValue,
  type ResponsiveValue,
} from '../responsive/responsiveValue';
import { useAdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import {
  computeTwoPaneLayout,
  type PaneSize,
  type TwoPaneArrangement,
} from './twoPaneLayout';
import { useWindowRectForHingeLayout } from './useWindowRectForHingeLayout';

type TwoPaneProps = {
  list: ReactNode;
  detail: ReactNode;
  /** Which item the detail pane shows; `null` shows the list when only one pane fits. */
  selectedKey: string | null;
  /** Called when the user backs out of the detail pane in single-pane mode (Android back included). */
  onBackFromDetail?: () => void;
  listWidth?: ResponsiveValue<DimensionValue>;
  /** Below this size, a hinge split falls back to the width-class layout. */
  minPaneSize?: number;
  testID?: string;
};

const TwoPaneArrangementContext = createContext<TwoPaneArrangement | null>(
  null,
);

/**
 * How the nearest `TwoPane` is currently arranged, e.g. so a detail pane shows a Back button only when it's
 * alone on screen. Width class alone can't answer this: a Z Flip in flex mode is compact yet split by its hinge.
 */
export function useTwoPaneArrangement(): TwoPaneArrangement {
  const arrangement = useContext(TwoPaneArrangementContext);
  if (!arrangement) {
    throw new Error('useTwoPaneArrangement must be used inside <TwoPane>.');
  }
  return arrangement;
}

const DEFAULT_LIST_WIDTH: ResponsiveValue<DimensionValue> = {
  medium: '40%',
  expanded: 360,
  large: 400,
};

const HIDDEN_PANE_STYLE: ViewStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  opacity: 0,
};

function toPaneStyle(
  paneSize: PaneSize,
  direction: 'row' | 'column-reverse',
): ViewStyle {
  if (paneSize.kind === 'hidden') {
    return HIDDEN_PANE_STYLE;
  }
  if (paneSize.kind === 'fill') {
    return { flex: 1 };
  }
  return direction === 'row'
    ? { width: paneSize.size }
    : { height: paneSize.size };
}

function hiddenPaneProps(isHidden: boolean) {
  return {
    pointerEvents: isHidden ? ('none' as const) : ('auto' as const),
    accessibilityElementsHidden: isHidden,
    importantForAccessibility: isHidden
      ? ('no-hide-descendants' as const)
      : ('auto' as const),
  };
}

/**
 * List-detail layout that adapts to width class and fold posture: one pane on compact windows,
 * side by side on wider ones, and split exactly at a separating hinge (book, tabletop, Surface Duo).
 * Both panes stay mounted in every arrangement — a hidden pane is kept offscreen, not unmounted — so
 * unfolding or resizing never loses scroll position, input or focus.
 */
export function TwoPane({
  list,
  detail,
  selectedKey,
  onBackFromDetail,
  listWidth = DEFAULT_LIST_WIDTH,
  minPaneSize = 240,
  testID,
}: TwoPaneProps) {
  const theme = useAdaptiveTheme();
  const { widthClass, heightClass } = useWindowSizeClass();
  const { hinge } = useFoldingFeature();
  const { containerRef, containerRectInWindow, onContainerLayout } =
    useWindowRectForHingeLayout(hinge);

  const layout = computeTwoPaneLayout({
    widthClass,
    heightClass,
    hinge,
    containerRectInWindow,
    listWidth: resolveResponsiveValue(listWidth, widthClass) ?? '40%',
    hasSelection: selectedKey !== null,
    minPaneSize,
    isRTL: I18nManager.isRTL,
  });

  const isShowingOnlyDetail =
    layout.arrangement === 'singlePane' && selectedKey !== null;

  useEffect(() => {
    if (!isShowingOnlyDetail || !onBackFromDetail) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onBackFromDetail();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isShowingOnlyDetail, onBackFromDetail]);

  const isListHidden = layout.listPane.kind === 'hidden';
  const isDetailHidden = layout.detailPane.kind === 'hidden';
  const showsDivider = layout.arrangement === 'sideBySide';

  return (
    <TwoPaneArrangementContext.Provider value={layout.arrangement}>
      <View
        ref={containerRef}
        onLayout={onContainerLayout}
        testID={testID}
        style={[styles.container, { flexDirection: layout.direction }]}
      >
        <View
          key="list"
          testID={testID && `${testID}-list`}
          style={[
            toPaneStyle(layout.listPane, layout.direction),
            showsDivider && {
              borderEndWidth: StyleSheet.hairlineWidth,
              borderEndColor: theme.colors.border,
            },
          ]}
          {...hiddenPaneProps(isListHidden)}
        >
          {list}
        </View>
        <View
          key="gutter"
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={
            layout.direction === 'row'
              ? { width: layout.gutterSize }
              : { height: layout.gutterSize }
          }
        />
        <View
          key="detail"
          testID={testID && `${testID}-detail`}
          style={toPaneStyle(layout.detailPane, layout.direction)}
          {...hiddenPaneProps(isDetailHidden)}
        >
          {detail}
        </View>
      </View>
    </TwoPaneArrangementContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
