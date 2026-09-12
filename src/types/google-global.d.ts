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
