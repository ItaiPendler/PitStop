/**
 * Thin promise-based wrapper around the Google Identity Services (GIS) token
 * client. See spec.md §4.1 — token model only, no client secret, scoped to
 * `drive.file` so the app can only touch the sheet the user explicitly picks.
 */
import type { GisTokenClient, GisTokenResponse } from './gis';

export const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

let tokenClient: GisTokenClient | undefined;
// GIS only lets us register one callback at client-creation time, so we keep
// the client stable and delegate to whichever request is currently in flight.
let pending:
  { reject: (error: Error) => void; resolve: (response: GisTokenResponse) => void } | undefined;

const waitForGis = (): Promise<void> => {
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timeoutMs = 10_000;

    const poll = () => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Google Identity Services script failed to load.'));
        return;
      }
      window.setTimeout(poll, 100);
    };

    poll();
  });
};

const getTokenClient = async (): Promise<GisTokenClient> => {
  if (tokenClient) return tokenClient;
  if (!CLIENT_ID) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID. Set it in your .env file (see spec.md §4.1).');
  }

  await waitForGis();

  tokenClient = window.google!.accounts.oauth2.initTokenClient({
    callback: (response) => {
      if (response.error) {
        pending?.reject(new Error(response.error));
      } else {
        pending?.resolve(response);
      }
      pending = undefined;
    },
    client_id: CLIENT_ID,
    error_callback: (error) => {
      pending?.reject(new Error(error.message ?? error.type));
      pending = undefined;
    },
    scope: DRIVE_FILE_SCOPE,
  });

  return tokenClient;
};

export interface RequestAccessTokenOptions {
  /** '' = silent/no prompt (used for refresh); 'consent' forces the picker/consent screen. */
  prompt?: '' | 'consent' | 'select_account';
}

/**
 * Requests (or silently refreshes) an access token. Resolves with the token
 * response, or rejects if the user cancels / an error occurs.
 */
export const requestAccessToken = async (
  options: RequestAccessTokenOptions = {},
): Promise<GisTokenResponse> => {
  const client = await getTokenClient();

  return new Promise((resolve, reject) => {
    pending = { reject, resolve };
    client.requestAccessToken({ prompt: options.prompt ?? 'consent' });
  });
};

export const revokeAccessToken = (accessToken: string): Promise<void> =>
  new Promise((resolve) => {
    if (!window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    window.google.accounts.oauth2.revoke(accessToken, () => resolve());
  });
