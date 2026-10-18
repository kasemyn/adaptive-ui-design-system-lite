import type { ComponentRef } from 'react';
import type { View } from 'react-native';

/** What a `ref` on a `View` holds, in a form that type-checks on every supported React Native version (0.76+). */
export type HostViewInstance = ComponentRef<typeof View>;

/** Structural ref type, assignable to `ref` under both React 18 and React 19 typings. */
export type HostViewRef = { current: HostViewInstance | null };
