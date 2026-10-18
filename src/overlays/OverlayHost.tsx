import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';

type MountedOverlay = { id: string; content: ReactNode };

type OverlayRegistry = {
  upsert(id: string, content: ReactNode): void;
  remove(id: string): void;
};

const OverlayRegistryContext = createContext<OverlayRegistry | null>(null);

/**
 * Renders overlays in the app's own root view rather than a separate native window (RN `Modal`),
 * so they resize with a desktop window and can change presentation while open.
 */
export function OverlayHost({ children }: { children: ReactNode }) {
  const [mountedOverlays, setMountedOverlays] = useState<
    readonly MountedOverlay[]
  >([]);

  const registry = useMemo<OverlayRegistry>(
    () => ({
      upsert(id, content) {
        setMountedOverlays(previous => {
          const index = previous.findIndex(overlay => overlay.id === id);
          if (index === -1) {
            return [...previous, { id, content }];
          }
          const next = [...previous];
          next[index] = { id, content };
          return next;
        });
      },
      remove(id) {
        setMountedOverlays(previous =>
          previous.filter(overlay => overlay.id !== id),
        );
      },
    }),
    [],
  );

  const isAnyOverlayMounted = mountedOverlays.length > 0;

  return (
    <OverlayRegistryContext.Provider value={registry}>
      <View
        style={styles.appContent}
        accessibilityElementsHidden={isAnyOverlayMounted}
        importantForAccessibility={
          isAnyOverlayMounted ? 'no-hide-descendants' : 'auto'
        }
      >
        {children}
      </View>
      {mountedOverlays.map(overlay => (
        <View
          key={overlay.id}
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
        >
          {overlay.content}
        </View>
      ))}
    </OverlayRegistryContext.Provider>
  );
}

/**
 * Renders `children` into the root `OverlayHost`.
 * React context from between the host and this portal (e.g. a screen's navigation) is not available inside it.
 */
export function OverlayPortal({ children }: { children: ReactNode }) {
  const registry = useContext(OverlayRegistryContext);
  if (!registry) {
    throw new Error('OverlayPortal must be used inside <AdaptiveProvider>.');
  }
  const id = useId();

  useLayoutEffect(() => {
    registry.upsert(id, children);
  });

  useLayoutEffect(() => () => registry.remove(id), [registry, id]);

  return null;
}

const styles = StyleSheet.create({
  appContent: { flex: 1 },
});
