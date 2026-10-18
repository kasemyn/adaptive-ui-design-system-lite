import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  readCurrentWindowLayoutReport,
  subscribeToWindowLayoutReports,
  warnIfFoldModuleMissingInDevelopment,
} from '../native/windowLayoutReports';
import {
  createAdaptiveDisplayStore,
  type AdaptiveDisplayStore,
} from './adaptiveDisplayStore';
import { NO_INSETS } from './hingeInsets';

const AdaptiveDisplayStoreContext = createContext<AdaptiveDisplayStore | null>(
  null,
);

export function useAdaptiveDisplayStore(): AdaptiveDisplayStore {
  const store = useContext(AdaptiveDisplayStoreContext);
  if (!store) {
    throw new Error(
      'Adaptive UI hooks must be used inside <AdaptiveProvider>. Mount it once at the app root.',
    );
  }
  return store;
}

function createAdaptiveDisplayStoreFromDevice(): AdaptiveDisplayStore {
  const initialFrame = initialWindowMetrics?.frame ?? Dimensions.get('window');
  const store = createAdaptiveDisplayStore({
    windowSize: { width: initialFrame.width, height: initialFrame.height },
    safeAreaInsets: initialWindowMetrics?.insets ?? NO_INSETS,
    foldingFeature: null,
  });
  const initialWindowLayoutReport = readCurrentWindowLayoutReport();
  if (initialWindowLayoutReport) {
    store.reportWindowLayout(initialWindowLayoutReport);
  }
  return store;
}

function SafeAreaInsetsBridge({ store }: { store: AdaptiveDisplayStore }) {
  const safeAreaInsets = useSafeAreaInsets();
  useLayoutEffect(() => {
    store.setSafeAreaInsets(safeAreaInsets);
  }, [store, safeAreaInsets]);
  return null;
}

type AdaptiveDisplayProviderProps = {
  children: ReactNode;
  store?: AdaptiveDisplayStore;
};

export function AdaptiveDisplayProvider({
  children,
  store: providedStore,
}: AdaptiveDisplayProviderProps) {
  const [store] = useState(
    () => providedStore ?? createAdaptiveDisplayStoreFromDevice(),
  );

  useEffect(() => {
    warnIfFoldModuleMissingInDevelopment();
    const unsubscribe = subscribeToWindowLayoutReports(
      store.reportWindowLayout,
    );
    // The native side reports as soon as the module is created, often before this subscription exists.
    // It caches that report, so reading once after subscribing can't miss it.
    const reportEmittedBeforeSubscribing = readCurrentWindowLayoutReport();
    if (reportEmittedBeforeSubscribing) {
      store.reportWindowLayout(reportEmittedBeforeSubscribing);
    }
    return () => {
      unsubscribe();
      if (!providedStore) {
        store.dispose();
      }
    };
  }, [store, providedStore]);

  const updateWindowSizeFromRootLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      store.setWindowSize({ width, height });
    },
    [store],
  );

  return (
    <AdaptiveDisplayStoreContext.Provider value={store}>
      <SafeAreaInsetsBridge store={store} />
      <View style={styles.root} onLayout={updateWindowSizeFromRootLayout}>
        {children}
      </View>
    </AdaptiveDisplayStoreContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
