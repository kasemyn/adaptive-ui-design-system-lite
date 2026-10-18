import type { DimensionValue, ViewStyle } from 'react-native';
import {
  resolveResponsiveValue,
  type ResponsiveValue,
} from '../responsive/responsiveValue';
import type { WindowWidthClass } from '../responsive/windowSizeClass';
import type { AdaptiveTheme } from '../theme/AdaptiveThemeProvider';
import type { ColorToken, RadiusToken, SpacingToken } from '../theme/tokens';

const SPACING_PROP_STYLE_KEYS = {
  padding: 'padding',
  paddingX: 'paddingHorizontal',
  paddingY: 'paddingVertical',
  paddingTop: 'paddingTop',
  paddingBottom: 'paddingBottom',
  paddingStart: 'paddingStart',
  paddingEnd: 'paddingEnd',
  margin: 'margin',
  marginX: 'marginHorizontal',
  marginY: 'marginVertical',
  marginTop: 'marginTop',
  marginBottom: 'marginBottom',
  gap: 'gap',
  rowGap: 'rowGap',
  columnGap: 'columnGap',
} as const satisfies Record<string, keyof ViewStyle>;

type SpacingPropName = keyof typeof SPACING_PROP_STYLE_KEYS;

const LAYOUT_PROP_STYLE_KEYS = {
  direction: 'flexDirection',
  align: 'alignItems',
  justify: 'justifyContent',
  wrap: 'flexWrap',
  flex: 'flex',
  width: 'width',
  height: 'height',
  minWidth: 'minWidth',
  maxWidth: 'maxWidth',
  minHeight: 'minHeight',
} as const satisfies Record<string, keyof ViewStyle>;

type LayoutPropName = keyof typeof LAYOUT_PROP_STYLE_KEYS;

export type BoxTokenProps = {
  [PropName in SpacingPropName]?: ResponsiveValue<SpacingToken>;
} & {
  direction?: ResponsiveValue<ViewStyle['flexDirection']>;
  align?: ResponsiveValue<ViewStyle['alignItems']>;
  justify?: ResponsiveValue<ViewStyle['justifyContent']>;
  wrap?: ResponsiveValue<ViewStyle['flexWrap']>;
  flex?: ResponsiveValue<number>;
  width?: ResponsiveValue<DimensionValue>;
  height?: ResponsiveValue<DimensionValue>;
  minWidth?: ResponsiveValue<DimensionValue>;
  maxWidth?: ResponsiveValue<DimensionValue>;
  minHeight?: ResponsiveValue<DimensionValue>;
  background?: ColorToken;
  radius?: ResponsiveValue<RadiusToken>;
  borderColor?: ColorToken;
  borderWidth?: number;
};

const BOX_TOKEN_PROP_NAMES = new Set<string>([
  ...Object.keys(SPACING_PROP_STYLE_KEYS),
  ...Object.keys(LAYOUT_PROP_STYLE_KEYS),
  'background',
  'radius',
  'borderColor',
  'borderWidth',
]);

export function splitBoxTokenProps<Props extends BoxTokenProps>(
  props: Props,
): { tokenProps: BoxTokenProps; otherProps: Omit<Props, keyof BoxTokenProps> } {
  const tokenProps: Record<string, unknown> = {};
  const otherProps: Record<string, unknown> = {};
  Object.entries(props).forEach(([propName, value]) => {
    if (BOX_TOKEN_PROP_NAMES.has(propName)) {
      tokenProps[propName] = value;
    } else {
      otherProps[propName] = value;
    }
  });
  return {
    tokenProps: tokenProps as BoxTokenProps,
    otherProps: otherProps as Omit<Props, keyof BoxTokenProps>,
  };
}

export function resolveBoxStyle(
  tokenProps: BoxTokenProps,
  widthClass: WindowWidthClass,
  theme: AdaptiveTheme,
): ViewStyle {
  const style: Record<string, unknown> = {};

  (Object.keys(SPACING_PROP_STYLE_KEYS) as SpacingPropName[]).forEach(
    propName => {
      const value = tokenProps[propName];
      const spacingToken =
        value === undefined
          ? undefined
          : resolveResponsiveValue(value, widthClass);
      if (spacingToken !== undefined) {
        style[SPACING_PROP_STYLE_KEYS[propName]] = theme.spacing[spacingToken];
      }
    },
  );

  (Object.keys(LAYOUT_PROP_STYLE_KEYS) as LayoutPropName[]).forEach(
    propName => {
      const value = tokenProps[propName];
      const resolved =
        value === undefined
          ? undefined
          : resolveResponsiveValue<unknown>(value, widthClass);
      if (resolved !== undefined) {
        style[LAYOUT_PROP_STYLE_KEYS[propName]] = resolved;
      }
    },
  );

  if (tokenProps.background) {
    style.backgroundColor = theme.colors[tokenProps.background];
  }
  const radiusToken =
    tokenProps.radius === undefined
      ? undefined
      : resolveResponsiveValue(tokenProps.radius, widthClass);
  if (radiusToken !== undefined) {
    style.borderRadius = theme.radii[radiusToken];
  }
  if (tokenProps.borderColor) {
    style.borderColor = theme.colors[tokenProps.borderColor];
  }
  if (tokenProps.borderWidth !== undefined) {
    style.borderWidth = tokenProps.borderWidth;
  }

  return style as ViewStyle;
}
