import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoWallpaper.types';

type ExpoWallpaperModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoWallpaperModule extends NativeModule<ExpoWallpaperModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoWallpaperModule, 'ExpoWallpaperModule');
