import {
  WINDOW_WIDTH_CLASSES_ASCENDING,
  type WindowWidthClass,
} from './windowSizeClass';

export type ResponsiveValueByWidthClass<T> = Partial<
  Record<WindowWidthClass, T>
>;

export type ResponsiveValue<T> = T | ResponsiveValueByWidthClass<T>;

export function isResponsiveValueByWidthClass<T>(
  value: ResponsiveValue<T>,
): value is ResponsiveValueByWidthClass<T> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return (
    keys.length > 0 &&
    keys.every(key =>
      WINDOW_WIDTH_CLASSES_ASCENDING.includes(key as WindowWidthClass),
    )
  );
}

/**
 * Mobile-first: the value for the current width class, or else the nearest smaller class that defines one.
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  widthClass: WindowWidthClass,
): T | undefined {
  if (!isResponsiveValueByWidthClass(value)) {
    return value;
  }
  const currentIndex = WINDOW_WIDTH_CLASSES_ASCENDING.indexOf(widthClass);
  const classesFromCurrentDownToCompact = WINDOW_WIDTH_CLASSES_ASCENDING.slice(
    0,
    currentIndex + 1,
  ).reverse();
  const nearestDefinedClass = classesFromCurrentDownToCompact.find(
    candidate => value[candidate] !== undefined,
  );
  return nearestDefinedClass === undefined
    ? undefined
    : value[nearestDefinedClass];
}
