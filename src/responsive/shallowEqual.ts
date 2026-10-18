export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  const aKeys = Object.keys(a) as (keyof T)[];
  const bKeys = Object.keys(b) as (keyof T)[];
  return (
    aKeys.length === bKeys.length &&
    aKeys.every(key => Object.is(a[key], b[key]))
  );
}
