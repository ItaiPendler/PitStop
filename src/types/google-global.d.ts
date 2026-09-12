// Single source of truth for `window.google` / `window.gapi` ambient typing.
// Both the GIS token client (src/auth) and the Google Picker (src/sheet) hang
// their APIs off `window.google`, so their shapes are merged here rather
// than each declaring `Window` globally (TypeScript errors if two files
// declare the same global property with different types).
import type { GisTokenClient, GisTokenClientConfig } from '../auth/gis';
import type { GooglePickerNamespace } from '../sheet/gapi';

export {};

declare global {
  interface Window {
    gapi?: {
      load: (apiName: string, callback: () => void) => void;
    };
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GisTokenClientConfig) => GisTokenClient;
          revoke: (accessToken: string, callback: () => void) => void;
        };
      };
      picker?: GooglePickerNamespace;
    };
  }
}
