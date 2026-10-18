# @fc/adaptive-ui

> **Demo project.** This package was shared for a live demo at the **React Native community meetup in London on 22 October 2026**. It is not a maintained library.

Adaptive React Native components for phones, foldables (Z Fold, Z Flip, Pixel Fold, Surface Duo, iPhone Duo), tablets and desktop windowing. Layouts respond to **the window's size class** and **the device's fold posture**, never to the device type.

```tsx
import { AdaptiveProvider, TwoPane, useAdaptiveLayout } from '@fc/adaptive-ui';
```

- **Supported:** React Native 0.76+ with the New Architecture.
- **Check native setup:** `npx adaptive-ui doctor`
- **Adopting it in an existing app:** [docs/adoption.md](../../docs/adoption.md)
- **What changed between versions:** [CHANGELOG.md](./CHANGELOG.md)

---

## Contents

1. [Why this package exists](#why-this-package-exists)
2. [The mental model](#the-mental-model)
3. [Quick start](#quick-start)
4. [Before and after](#before-and-after): ten side-by-side comparisons
5. [API at a glance](#api-at-a-glance)
6. [Device presets](#device-presets)
7. [Platform notes](#platform-notes)
8. [Talking points](#talking-points): one-liners for slides

---

## Why this package exists

Most React Native apps were built on one assumption: **the screen is a phone-shaped rectangle that never changes size.** That assumption no longer holds:

| Device / mode | What happens to the window |
| --- | --- |
| **Book-style foldable** (Z Fold, Pixel Fold) | Goes from 344dp wide to 690dp wide **while the app is open**, with a crease down the middle |
| **Flip phone** (Z Flip) | Half-folded "flex mode" splits the screen horizontally; the cover screen is close to square |
| **Dual-screen** (Surface Duo) | A 34dp physical hinge that **hides content** sits between two screens |
| **iPad Split View / Stage Manager** | An iPad window can be **375dp wide**, which is phone-sized |
| **Android desktop windowing, Chromebooks** | The user drags the window to any size, and it resizes on every frame |
| **Phone in landscape** | Wide but very short |

The usual code breaks in each of these situations:

- `isTablet()` is `true` on a Z Fold whether it's folded or not, and `false` on an unfolded Z Flip.
- `Dimensions.get('window')` is read once and goes stale after a fold.
- `useWindowDimensions()` re-renders the whole tree on every frame of a window drag.
- A conditional `isWide ? <SplitView/> : <Stack/>` **unmounts the screen** on unfold, so the user loses scroll position, half-typed input and focus.
- A `Modal` stretched across a Surface Duo puts its buttons **under the hinge**.
- A bottom tab bar on a 1920dp-wide desktop window wastes space and looks like a phone app blown up.

`@fc/adaptive-ui` replaces those patterns with one provider, a handful of hooks and components, test helpers, a lint preset and a setup doctor. Each one encodes a decision so that every screen in an app doesn't have to make it again.

---

## The mental model

### 1. Ask about the window, not the device

Every layout decision starts from the **window size class**. The breakpoints follow Material 3 and Jetpack WindowManager:

| Width class | Window width | Typical window |
| --- | --- | --- |
| `compact` | < 600dp | Phone portrait, folded Z Fold, iPad Split View ⅓ |
| `medium` | 600–839dp | Unfolded Z Fold / iPhone Duo inner screen, iPad mini portrait |
| `expanded` | 840–1199dp | Phone landscape, small desktop window, Surface Duo spanned |
| `large` | 1200–1599dp | iPad Pro landscape |
| `xlarge` | ≥ 1600dp | Maximised desktop window |

| Height class | Window height |
| --- | --- |
| `compact` | < 480dp (phone landscape, Z Flip cover screen) |
| `medium` | 480–899dp |
| `expanded` | ≥ 900dp |

### 2. Fold posture is a second, independent input

| Posture | Meaning |
| --- | --- |
| `flat` | No fold, or fully open. The crease may still be visible. |
| `book` | Half-opened with a **vertical** hinge, held like a book |
| `tabletop` | Half-opened with a **horizontal** hinge, like a laptop (Z Flip flex mode) |

A Z Flip in flex mode is `compact` **and** `tabletop`. Width alone can't describe it, which is why the package exposes both.

### 3. Re-render on class changes, not on pixels

The hooks re-render only when a **size class, orientation or posture** changes. They don't re-render on every pixel of a desktop-window drag. A 960 → 1100dp resize causes **zero** re-renders, because the width class is `expanded` throughout.

### 4. Never remount on a layout switch

Every adaptive component (`TwoPane`, `Grid`, `AdaptiveModal`, `AdaptiveSheet`, the tab navigator chrome) renders **the same tree in every arrangement**. Only sizes and positions change, so folding and unfolding never loses state.

---

## Quick start

```tsx
// App.tsx
import { AdaptiveProvider, AdaptiveDebugBadge } from '@fc/adaptive-ui';

export default function App() {
  return (
    <AdaptiveProvider theme={brandTheme}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      {__DEV__ && <AdaptiveDebugBadge />}
    </AdaptiveProvider>
  );
}
```

```tsx
// Any screen
import { useAdaptiveLayout } from '@fc/adaptive-ui';

function Dashboard() {
  const { widthClass, posture, isAtLeast } = useAdaptiveLayout();
  return isAtLeast('medium') ? <WideDashboard /> : <NarrowDashboard />;
}
```

`AdaptiveDebugBadge` shows a small `medium × medium · book` readout in development, so you can see what the layout is reacting to as you fold the device.

---

## Before and after

Each comparison shows a common pattern, why it breaks, and the replacement.

### 1. "Is this a tablet?" → "How big is the window?"

**Before**

```tsx
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

const isLargeScreen = DeviceInfo.isTablet() || Platform.isPad;

function Dashboard() {
  return isLargeScreen ? <WideDashboard /> : <NarrowDashboard />;
}
```

❌ It describes the **device**, which never changes. A Z Fold is the same device folded (344dp) and unfolded (690dp). An iPad in Split View ⅓ is an iPad with a phone-sized window.

**After**

```tsx
import { useAdaptiveLayout } from '@fc/adaptive-ui';

function Dashboard() {
  const { isAtLeast } = useAdaptiveLayout();
  return isAtLeast('medium') ? <WideDashboard /> : <NarrowDashboard />;
}
```

✅ It describes the **window**, and updates live on fold, unfold, rotation, Split View and window resize.

---

### 2. `useWindowDimensions` → size-class hooks

**Before**

```tsx
function ProductCard() {
  const { width } = useWindowDimensions();
  const columns = width >= 840 ? 3 : width >= 600 ? 2 : 1;
  // ...
}
```

❌ It re-renders on **every frame** of a desktop-window drag, about 60 renders per second for each component that calls it. The magic numbers are also copied into every file.

**After**

```tsx
function ProductCard() {
  const columns = useResponsiveValue({ compact: 1, medium: 2, expanded: 3 });
  // ...
}
```

✅ It re-renders **only when the width class changes**. Values cascade mobile-first: `large` and `xlarge` inherit `3` from `expanded`. The return type is `number`, not `number | undefined`, because `compact` is given.

---

### 3. Conditional list/detail → `TwoPane`

**Before**

```tsx
function Inbox() {
  const { width } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (width >= 600) {
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <MessageList style={{ width: 360 }} onSelect={setSelectedId} />
        <MessageDetail id={selectedId} />
      </View>
    );
  }
  return selectedId ? (
    <MessageDetail id={selectedId} onBack={() => setSelectedId(null)} />
  ) : (
    <MessageList onSelect={setSelectedId} />
  );
}
```

❌ Unfolding switches between two **different trees**, so React unmounts `MessageList` and `MessageDetail`. Scroll position, a half-written reply and accessibility focus are all lost. The Android back button isn't handled in single-pane mode. On a half-folded Z Fold, the 360dp list sits **across the crease**.

**After**

```tsx
import { TwoPane, useTwoPaneArrangement } from '@fc/adaptive-ui';

function Inbox() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <TwoPane
      selectedKey={selectedId}
      onBackFromDetail={() => setSelectedId(null)}
      list={<MessageList onSelect={setSelectedId} />}
      detail={<MessageDetail id={selectedId} />}
    />
  );
}

function MessageDetail({ id }: { id: string | null }) {
  const showsBackButton = useTwoPaneArrangement() === 'singlePane';
  // ...
}
```

✅ The same tree is used in every arrangement. A hidden pane is kept offscreen, not unmounted, so **no state is lost on fold or unfold**. `TwoPane` picks one of four arrangements:

| Arrangement | When |
| --- | --- |
| `singlePane` | Compact window: list, or detail once something is selected |
| `sideBySide` | Medium and wider. The divider snaps onto the crease of a fully open foldable |
| `splitByVerticalHinge` | Book posture or Surface Duo: each pane gets exactly one side of the hinge |
| `splitByHorizontalHinge` | Tabletop / flex mode: detail on top, list on the bottom half |

It also handles the Android back button in single-pane mode, right-to-left languages, and screen readers (hidden panes are hidden from accessibility).

---

### 4. Content under the hinge → `HingeGutter`

**Before**

```tsx
<View style={{ flexDirection: 'row' }}>
  <Button title="Cancel" style={{ flex: 1 }} />
  <Button title="Confirm" style={{ flex: 1 }} />
</View>
```

❌ On a spanned Surface Duo the two buttons meet in the middle, right where a 34dp physical hinge **hides pixels and swallows touches**.

**After**

```tsx
import { HingeGutter, HStack, Button } from '@fc/adaptive-ui';

<HStack>
  <Button variant="secondary">Cancel</Button>
  <HingeGutter />
  <Button>Confirm</Button>
</HStack>
```

✅ It reserves exactly the hinge's thickness when there is a separating hinge, and renders nothing everywhere else. Use `<HingeGutter showGuide />` while developing to see the hinge area tinted.

---

### 5. `Modal` → `AdaptiveModal` / `AdaptiveSheet`

**Before**

```tsx
import { Modal } from 'react-native';

<Modal visible={visible} onRequestClose={close} animationType="slide">
  <EditProfileForm />
</Modal>
```

❌ It's full-screen on a 1920dp desktop window, a bottom sheet stretched across a whole iPad, and centred **over the hinge** on a spanned dual-screen device.

**After**

```tsx
import { AdaptiveModal, AdaptiveSheet, Button } from '@fc/adaptive-ui';

<AdaptiveModal
  visible={visible}
  onRequestClose={close}
  title="Edit profile"
  footer={<Button onPress={save}>Save</Button>}
>
  <EditProfileForm />
</AdaptiveModal>

<AdaptiveSheet visible={filtersOpen} onRequestClose={closeFilters} title="Filters">
  <FilterOptions />
</AdaptiveSheet>
```

✅ Each component picks its presentation from the window:

| Component | Compact | Medium and up | Short window (phone landscape) |
| --- | --- | --- | --- |
| `AdaptiveModal` | Full screen | Centred dialog | Full screen |
| `AdaptiveSheet` | Bottom sheet (drag to dismiss) | Side sheet | — |

Neither is ever placed across a separating hinge. Each **switches presentation while open** (unfold with the sheet open and it becomes a side sheet) without remounting the form inside, so typed input is kept. Android back, scrim tap and moving accessibility focus into the overlay are built in. You can override the defaults per breakpoint: `presentation={{ compact: 'fullscreen', expanded: 'dialog' }}`.

---

### 6. `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView` → `Screen`

**Before**

```tsx
<SafeAreaView style={{ flex: 1 }}>
  <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <SettingsForm />
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
```

❌ Three wrappers on every screen. Text runs edge to edge on a maximised desktop window, which makes it hard to read. When a navigation rail appears on the left, the screen **still pads for the left inset**, so the gap is doubled.

**After**

```tsx
import { Screen } from '@fc/adaptive-ui';

<Screen>
  <SettingsForm />
</Screen>
```

✅ It handles the safe area, keyboard avoidance and scrolling in one component. Content is capped at a readable width (`contentWidth="text" | "content" | "wide" | "full"`), padding grows with the window (16 → 24 → 32dp), and it **skips the edges that the navigation chrome already covers**.

---

### 7. Bottom tabs everywhere → bottom bar, rail or drawer

**Before**

```tsx
const Tab = createBottomTabNavigator();

<Tab.Navigator screenOptions={{ headerShown: false }}>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Payments" component={PaymentsScreen} />
</Tab.Navigator>
```

❌ A bottom tab bar on an unfolded foldable, a tablet or a desktop window looks like a phone app stretched to fit.

**After**

```tsx
import { useAdaptiveTabsOptions } from '@fc/adaptive-ui/navigation';

const Tab = createBottomTabNavigator();

function Tabs() {
  const adaptiveTabsOptions = useAdaptiveTabsOptions({
    screenOptions: { headerShown: false },
    tabBar: props => <BrandTabBar {...props} />, // optional: your existing tab bar stays on phones
  });
  return (
    <Tab.Navigator {...adaptiveTabsOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
    </Tab.Navigator>
  );
}
```

✅ It's **the same navigator**, and only the chrome around it changes, so screens and their state survive fold, unfold and resize:

| Window | Navigation chrome |
| --- | --- |
| Compact | Bottom bar (yours, or React Navigation's) |
| Medium, or wide but short, or split by a vertical hinge | Navigation rail (80dp) |
| Wider than 1000dp | Permanent drawer (280dp) |

---

### 8. Hand-written breakpoints → responsive props and `Grid`

**Before**

```tsx
const { width } = useWindowDimensions();

<View style={{ padding: width >= 840 ? 32 : width >= 600 ? 24 : 16, flexDirection: width >= 600 ? 'row' : 'column' }}>
  {products.map(product => (
    <View key={product.id} style={{ width: width >= 840 ? '33%' : width >= 600 ? '50%' : '100%' }}>
      <ProductCard product={product} />
    </View>
  ))}
</View>
```

**After**

```tsx
import { Box, Grid } from '@fc/adaptive-ui';

<Box padding={{ compact: 'lg', medium: 'xl', expanded: 'xxl' }} direction={{ compact: 'column', medium: 'row' }}>
  <Grid columns={{ compact: 1, medium: 2, expanded: 3 }} gap="lg">
    {products.map(product => <ProductCard key={product.id} product={product} />)}
  </Grid>
</Box>
```

✅ `Box` is a drop-in replacement for `View`. Every spacing and layout prop accepts either a theme token or a `{ compact, medium, ... }` object. `Grid` reflows **without measuring and without remounting** its cells.

---

### 9. Mocking `Dimensions` in tests → real device presets

**Before**

```tsx
jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 690, height: 829, scale: 1, fontScale: 1 });
render(<Inbox />);
// Fold posture and the hinge can't be tested. Neither can unfolding without a remount.
```

**After**

```tsx
import { renderAtDisplay, DEVICE_PRESETS } from '@fc/adaptive-ui/testing';

it('keeps the draft reply when the Z Fold is unfolded', async () => {
  const { getByTestId, changeDisplay } = await renderAtDisplay(<Inbox />, {
    device: DEVICE_PRESETS.zFoldOuter,
  });

  // ...open a message and type a reply...

  await changeDisplay(DEVICE_PRESETS.zFoldInnerBook);

  expect(getByTestId('reply-input').props.value).toBe('Thanks!');
});
```

✅ The presets cover 20 real devices and postures, including the hinge. `changeDisplay` simulates a fold, unfold or resize **without unmounting**, so you can test the bugs that actually reach users. With your own render helper, use `createAdaptiveTestWrapper(device)` as a `wrapper`. Add `setupFiles: ['@fc/adaptive-ui/jest-setup']` and existing Jest configs need no other changes.

---

### 10. Guardrails: lint preset and doctor

**Lint preset:** flags the risky patterns and names the replacement.

```js
// .eslintrc.js
module.exports = {
  extends: ['@react-native', require.resolve('@fc/adaptive-ui/eslint')],
};
```

```
warning  Dimensions.get() is read once and goes stale when the device folds or the window resizes.
         Use useAdaptiveLayout() (size classes, posture) or useAdaptiveWindowSize() from '@fc/adaptive-ui'.
warning  isTablet() describes the device, not the window (a Z Fold is both).
warning  Use AdaptiveModal or AdaptiveSheet from '@fc/adaptive-ui': they become dialogs and side sheets
         on large screens and never sit across a hinge.
```

It's built only on ESLint core rules, so there's no plugin to install. It covers `Dimensions.get`, `useWindowDimensions`, `Platform.isPad`, `isTablet`, and `Modal` / `SafeAreaView` imported from `react-native`.

**Doctor:** finds native config that silently blocks adaptive behaviour.

```sh
npx adaptive-ui doctor
```

```
Project
  ✔ react-native 0.81.4 (0.76+ required)
  ✔ New Architecture is enabled

Android (android/app/src/main/AndroidManifest.xml)
  ✔ Launcher activity is resizeable
  ✖ configChanges is missing density: the activity restarts (losing all state) when these change
      → android:configChanges="keyboard|keyboardHidden|orientation|screenSize|smallestScreenSize|screenLayout|uiMode|density"
  ✔ No orientation lock

iOS (ios/MyApp/Info.plist)
  ✔ iPad multitasking is allowed (UIRequiresFullScreen is not true)
  ✔ All four iPad orientations are supported
```

Without the right `configChanges`, Android **restarts the activity on every fold**, and no JavaScript can preserve state through that. The doctor only reports problems and never edits your files.

---

## API at a glance

| Area | Exports |
| --- | --- |
| **Root** | `AdaptiveProvider` (mount once, outside `NavigationContainer`), `AdaptiveDebugBadge` |
| **Hooks** | `useAdaptiveLayout` (start here), `useResponsiveValue`, `useWindowSizeClass`, `useWindowWidthClass`, `useFoldingFeature`, `useHingeInsets`, `useAdaptiveSafeAreaInsets`, `useAdaptiveWindowSize` (per pixel, use sparingly), `useAdaptiveDisplaySelector` |
| **Layout** | `Screen`, `Container`, `TwoPane`, `useTwoPaneArrangement`, `Grid`, `HingeGutter`, `useLayoutPersistentState` |
| **Overlays** | `AdaptiveModal`, `AdaptiveSheet` |
| **Primitives** | `Box`, `HStack`, `VStack`, `Text`, `Button`, `Pressable`, `Icon`, `Divider`, `Spacer` |
| **Theme** | `useAdaptiveTheme`; pass brand colours (light/dark), spacing, radii and fonts to `AdaptiveProvider theme={...}` |
| **Pure helpers** | `classifyWindowWidth`, `classifyWindowHeight`, `isWindowWidthAtLeast`, `resolveResponsiveValue`, `hingeToInsets` |
| **`@fc/adaptive-ui/navigation`** | `useAdaptiveTabsOptions`, `useNavigationChromeVariant`, `NavigationRail`, `PermanentNavigationDrawer` |
| **`@fc/adaptive-ui/testing`** | `renderAtDisplay`, `createAdaptiveTestWrapper`, `DEVICE_PRESETS` |
| **Tooling** | `@fc/adaptive-ui/eslint`, `@fc/adaptive-ui/jest-setup`, `npx adaptive-ui doctor` |

`useLayoutPersistentState(key, initial)` works like `useState`, but the value survives a remount caused by a layout switch. Use it for the rare screens where you can't avoid a remount.

---

## Device presets

Available from `@fc/adaptive-ui/testing` as `DEVICE_PRESETS.<name>`. Values are approximate dp, taken from published specs.

| Preset | Window (dp) | Width class | Posture |
| --- | --- | --- | --- |
| `pixelPhone` | 412 × 915 | compact | flat |
| `pixelPhoneLandscape` | 915 × 412 | expanded | flat |
| `zFoldOuter` | 344 × 882 | compact | flat |
| `zFoldInnerFlat` | 690 × 829 | medium | flat (crease visible) |
| `zFoldInnerBook` | 690 × 829 | medium | book |
| `zFoldInnerTabletop` | 829 × 690 | medium | tabletop |
| `zFlipCover` | 384 × 399 | compact | flat |
| `zFlipMain` | 411 × 1006 | compact | flat |
| `zFlipFlexMode` | 411 × 1006 | compact | tabletop |
| `surfaceDuoSingleScreen` | 540 × 720 | compact | flat |
| `surfaceDuoSpanned` | 1114 × 720 | expanded | book (34dp hinge) |
| `iPhoneDuoOuter` | 466 × 678 | compact | flat |
| `iPhoneDuoInnerFlat` | 951 × 669 | expanded | flat |
| `iPhoneDuoInnerBook` | 951 × 669 | expanded | book |
| `iPhoneDuoInnerTabletop` | 669 × 951 | medium | tabletop |
| `iPadMiniPortrait` | 744 × 1133 | medium | flat |
| `iPadProLandscape` | 1376 × 1032 | large | flat |
| `iPadSplitViewOneThird` | 375 × 1024 | compact | flat |
| `desktopWindowSmall` | 960 × 640 | expanded | flat |
| `desktopWindowMaximised` | 1920 × 1040 | xlarge | flat |

---

## Platform notes

- **Android:** fold posture and hinge position come from Jetpack WindowManager (`WindowInfoTracker`) through a TurboModule that links automatically. If the module isn't linked (New Architecture off, or the app wasn't rebuilt), the app still works but reports every fold as `flat`, and a development warning says so.
- **iOS / iPadOS:** size classes respond to Split View, Slide Over, Stage Manager and rotation. There's no iOS native code. The iPhone Duo presets are for layout tests.
- **Desktop windowing / Chromebooks:** size classes update as the window resizes, and components re-render only when a class boundary is crossed.

---

## Talking points

Short lines to lift into slides or a PR description.

- **"Ask about the window, not the device."** `isTablet()` is the wrong question on a device that is both.
- **"A fold is a resize that happens while the user is mid-task."** Adaptive UI is about **not losing their state**, not only about looking nice on big screens.
- **"Same tree, different sizes."** Every component keeps its children mounted across layouts, so scroll, input and focus survive.
- **"Re-render on meaning, not on pixels."** Hooks fire on size-class changes, not on every frame of a window drag.
- **"The hinge is part of the layout."** Panes split exactly at it, and nothing interactive sits underneath it.
- **"One decision, made once."** Breakpoints, modal vs dialog, bar vs rail vs drawer, and safe-area edges live in the package, not in every screen.
- **"Testable."** `renderAtDisplay(<Screen />, { device: zFoldOuter })`, then `changeDisplay(zFoldInnerBook)`, then assert nothing was lost.
- **"Guardrails, not guidelines."** The lint preset catches regressions in review, and the doctor catches native config that silently breaks everything.
- **"Incremental adoption."** Each step (provider, doctor, lint, one screen, navigation, tests) ships value on its own. See [docs/adoption.md](../../docs/adoption.md).
