# Changelog

## Unreleased

### Added
- iPhone Duo device presets: `iPhoneDuoOuter`, `iPhoneDuoInnerFlat`, `iPhoneDuoInnerBook`, `iPhoneDuoInnerTabletop`.

### Fixed
- `AdaptiveModal` dialogs centre within the safe area, so uneven side insets no longer push the dialog under one of them.

## 0.2.0

Adoption release: everything needed to drop the package into an existing app.

### Added
- `AdaptiveProvider` `theme` prop: brand colours (per light/dark), spacing, radii, a global `fontFamily` and per-variant typography layered over the defaults.
- `AdaptiveProvider` adds a `SafeAreaProvider` itself when the app doesn't have one.
- `useAdaptiveLayout()`: size classes, orientation, posture, hinge and `isAtLeast()` in one hook.
- `useAdaptiveTabsOptions({ tabBar })`: keep the app's existing custom tab bar on phones.
- `createAdaptiveTestWrapper(device)`: a `wrapper` for any render function or Testing Library version.
- `@fc/adaptive-ui/jest-setup` and a CommonJS build, so existing Jest configs need no `transformIgnorePatterns`.
- `npx adaptive-ui doctor`: report-only check of the Android manifest, Info.plist, React Native version and New Architecture.
- `@fc/adaptive-ui/eslint`: warnings for `Dimensions.get`, `useWindowDimensions`, `Platform.isPad`, `isTablet`, and `Modal`/`SafeAreaView` from `react-native`.
- `AdaptiveDebugBadge`: development readout of size class and posture.
- A development warning when the Android fold module isn't linked.
- `npm run release:local` (repo root) publishes to the local yalc store.

### Changed
- **Breaking:** `useAdaptiveTabsOptions(screenOptions)` is now `useAdaptiveTabsOptions({ screenOptions })`.
- `useResponsiveValue` returns `T` (not `T | undefined`) when a `compact` value or a plain value is given.
- The permanent navigation drawer appears only on windows wider than 1000dp; narrower windows get the rail.
- `TwoPane` puts its divider on the crease of a fully open foldable.
- Supports React Native 0.76+ (New Architecture). Verified by typechecking against 0.76 and 0.87, and by a dry-run adoption into a fresh 0.76.9 app. Subpath imports resolve without Metro package-exports support.
- `jest-setup` no longer depends on `react-native-safe-area-context`'s own mock, which ships untranspiled in 4.x.

## 0.1.0

Proof of concept: responsive core, Android fold module, primitives, layout, overlays and adaptive navigation.
