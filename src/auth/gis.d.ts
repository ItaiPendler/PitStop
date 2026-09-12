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
