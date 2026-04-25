import { NativeModule, requireNativeModule } from 'expo';

import { ExpoWallpaperModuleEvents } from './ExpoWallpaper.types';

declare class ExpoWallpaperModule extends NativeModule<ExpoWallpaperModuleEvents> {
  startRotation(images: string[], intervalMs: number, targets: string[]): Promise<void>;
  stopRotation(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoWallpaperModule>('ExpoWallpaper');
