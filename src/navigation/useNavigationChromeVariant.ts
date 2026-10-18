import type { AdaptiveDisplaySnapshot } from '../responsive/adaptiveDisplaySnapshot';
import {
  useAdaptiveDisplaySelector,
  useFoldingFeature,
  useWindowSizeClass,
} from '../responsive/adaptiveDisplayHooks';
import {
  isWindowWideEnoughForPermanentDrawer,
  resolveNavigationChromeVariant,
  type NavigationChromeVariant,
} from './navigationChromeVariant';

const selectIsWideEnoughForDrawer = (snapshot: AdaptiveDisplaySnapshot) =>
  isWindowWideEnoughForPermanentDrawer(snapshot.windowSize.width);

/** Which navigation chrome fits the current window. Has no React Navigation dependency. */
export function useNavigationChromeVariant(): NavigationChromeVariant {
  const { widthClass, heightClass } = useWindowSizeClass();
  const isWideEnoughForDrawer = useAdaptiveDisplaySelector(
    selectIsWideEnoughForDrawer,
  );
  const { hinge } = useFoldingFeature();
  return resolveNavigationChromeVariant({
    widthClass,
    heightClass,
    isWideEnoughForDrawer,
    hinge,
  });
}
