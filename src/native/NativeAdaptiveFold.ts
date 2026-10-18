import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

// Declared locally because React Native 0.76 and 0.80+ expose the codegen type from different, incompatible paths.
// Codegen recognises an event emitter by the type's name, so this alias is understood by both.
type EventEmitter<T> = (handler: (arg: T) => void) => { remove(): void };

export type NativeFoldingFeature = {
  x: number;
  y: number;
  width: number;
  height: number;
  state: string;
  orientation: string;
  isSeparating: boolean;
  occlusionType: string;
};

export type NativeWindowLayout = {
  windowWidth: number;
  windowHeight: number;
  foldingFeatures: NativeFoldingFeature[];
};

export interface Spec extends TurboModule {
  getCurrentWindowLayout(): NativeWindowLayout | null;
  readonly onWindowLayoutChange: EventEmitter<NativeWindowLayout>;
}

export default TurboModuleRegistry.get<Spec>('AdaptiveFold');
