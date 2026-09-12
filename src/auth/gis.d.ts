// Minimal ambient types for the Google Identity Services (GIS) token client.
// Docs: https://developers.google.com/identity/oauth2/web/reference/js-reference
export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GisTokenClientConfig) => GisTokenClient;
          revoke: (accessToken: string, callback: () => void) => void;
        };
      };
    };
  }
}

export interface GisTokenClient {
  requestAccessToken: (overrides?: { prompt?: '' | 'consent' | 'select_account' }) => void;
}

export interface GisTokenClientConfig {
  callback: (response: GisTokenResponse) => void;
  client_id: string;
  scope: string;
  error_callback?: (error: GisTokenError) => void;
}

export interface GisTokenError {
  type: string;
  message?: string;
}

export interface GisTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
}
