import {
  createContext,
  useCallback,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type LayoutPersistentStateMap = Map<string, unknown>;

const LayoutPersistentStateContext =
  createContext<LayoutPersistentStateMap | null>(null);

export function LayoutPersistentStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [stateByKey] = useState<LayoutPersistentStateMap>(() => new Map());
  return (
    <LayoutPersistentStateContext.Provider value={stateByKey}>
      {children}
    </LayoutPersistentStateContext.Provider>
  );
}

/**
 * `useState` that survives the component being unmounted and remounted by a layout switch (fold, unfold, resize).
 * Only needed where a remount can't be avoided; adaptive components in this package keep their children mounted.
 * Held in memory for the app session, not persisted to disk.
 */
export function useLayoutPersistentState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const stateByKey = useContext(LayoutPersistentStateContext);
  if (!stateByKey) {
    throw new Error(
      'useLayoutPersistentState must be used inside <AdaptiveProvider>.',
    );
  }

  const [value, setValue] = useState<T>(() => {
    if (stateByKey.has(key)) {
      return stateByKey.get(key) as T;
    }
    const resolvedInitialValue =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    stateByKey.set(key, resolvedInitialValue);
    return resolvedInitialValue;
  });

  const setPersistedValue = useCallback<Dispatch<SetStateAction<T>>>(
    action => {
      setValue(previous => {
        const next =
          typeof action === 'function'
            ? (action as (previousValue: T) => T)(previous)
            : action;
        stateByKey.set(key, next);
        return next;
      });
    },
    [key, stateByKey],
  );

  return [value, setPersistedValue];
}
