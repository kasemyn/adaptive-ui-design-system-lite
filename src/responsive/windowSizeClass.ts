export type WindowWidthClass =
  | 'compact'
  | 'medium'
  | 'expanded'
  | 'large'
  | 'xlarge';

export type WindowHeightClass = 'compact' | 'medium' | 'expanded';

export type WindowOrientation = 'portrait' | 'landscape';

export type WindowSize = { width: number; height: number };

export const WINDOW_WIDTH_CLASSES_ASCENDING: readonly WindowWidthClass[] = [
  'compact',
  'medium',
  'expanded',
  'large',
  'xlarge',
];

const WINDOW_WIDTH_CLASS_MIN_DP: Record<WindowWidthClass, number> = {
  compact: 0,
  medium: 600,
  expanded: 840,
  large: 1200,
  xlarge: 1600,
};

const WINDOW_HEIGHT_CLASS_MIN_DP: Record<WindowHeightClass, number> = {
  compact: 0,
  medium: 480,
  expanded: 900,
};

export function classifyWindowWidth(widthDp: number): WindowWidthClass {
  const matching = WINDOW_WIDTH_CLASSES_ASCENDING.filter(
    widthClass => widthDp >= WINDOW_WIDTH_CLASS_MIN_DP[widthClass],
  );
  return matching[matching.length - 1] ?? 'compact';
}

export function classifyWindowHeight(heightDp: number): WindowHeightClass {
  if (heightDp >= WINDOW_HEIGHT_CLASS_MIN_DP.expanded) {
    return 'expanded';
  }
  if (heightDp >= WINDOW_HEIGHT_CLASS_MIN_DP.medium) {
    return 'medium';
  }
  return 'compact';
}

export function classifyWindowOrientation(
  windowSize: WindowSize,
): WindowOrientation {
  return windowSize.width > windowSize.height ? 'landscape' : 'portrait';
}

export function isWindowWidthAtLeast(
  widthClass: WindowWidthClass,
  minimumWidthClass: WindowWidthClass,
): boolean {
  return (
    WINDOW_WIDTH_CLASSES_ASCENDING.indexOf(widthClass) >=
    WINDOW_WIDTH_CLASSES_ASCENDING.indexOf(minimumWidthClass)
  );
}
