import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type SafeAreaEdge = 'top' | 'right' | 'bottom' | 'left';

const ConsumedSafeAreaEdgesContext = createContext<readonly SafeAreaEdge[]>([]);

/**
 * Declares edges whose safe-area inset is already handled by surrounding chrome (e.g. a bottom tab bar or a
 * navigation rail), so `Screen` doesn't pad them a second time. Which edges those are changes with window size.
 */
export function ConsumedSafeAreaEdgesProvider({
  edges,
  children,
}: {
  edges: readonly SafeAreaEdge[];
  children: ReactNode;
}) {
  const parentEdges = useContext(ConsumedSafeAreaEdgesContext);
  const mergedEdgesKey = Array.from(new Set([...parentEdges, ...edges]))
    .sort()
    .join(',');
  const mergedEdges = useMemo(
    () => (mergedEdgesKey ? (mergedEdgesKey.split(',') as SafeAreaEdge[]) : []),
    [mergedEdgesKey],
  );
  return (
    <ConsumedSafeAreaEdgesContext.Provider value={mergedEdges}>
      {children}
    </ConsumedSafeAreaEdgesContext.Provider>
  );
}

export function useConsumedSafeAreaEdges(): readonly SafeAreaEdge[] {
  return useContext(ConsumedSafeAreaEdgesContext);
}
