import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthContext, AuthStatus } from './context';
import { requestAccessToken, revokeAccessToken } from './googleTokenClient';

const REFRESH_MARGIN_MS = 60_000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState(AuthStatus.SignedOut);
  const [accessToken, setAccessToken] = useState<string>();
  const [error, setError] = useState<string>();
  const refreshTimer = useRef<number | undefined>(undefined);
  // A ref avoids the TDZ self-reference a recursive useCallback would create.
  const scheduleRefreshRef = useRef<(expiresInSeconds: number) => void>(() => {});

  useEffect(() => {
    scheduleRefreshRef.current = (expiresInSeconds: number) => {
      window.clearTimeout(refreshTimer.current);
      const delay = Math.max(expiresInSeconds * 1000 - REFRESH_MARGIN_MS, 5_000);
      refreshTimer.current = window.setTimeout(() => {
        requestAccessToken({ prompt: '' })
          .then((response) => {
            setAccessToken(response.access_token);
            setError(undefined);
            setStatus(AuthStatus.SignedIn);
            scheduleRefreshRef.current(response.expires_in);
          })
          .catch(() => {
            setError('החיבור ל-Google הסתיים. כדי להמשיך צריך להתחבר מחדש.');
            setStatus(AuthStatus.SignedOut);
            setAccessToken(undefined);
          });
      }, delay);
    };
  }, []);

  const signIn = useCallback(async () => {
    setStatus(AuthStatus.SigningIn);
    setError(undefined);
    try {
      const response = await requestAccessToken({ prompt: 'consent' });
      setAccessToken(response.access_token);
      setStatus(AuthStatus.SignedIn);
      scheduleRefreshRef.current(response.expires_in);
      return response.access_token;
    } catch (signInError) {
      setStatus(AuthStatus.Error);
      setError(signInError instanceof Error ? signInError.message : 'שגיאה בהתחברות ל-Google.');
      return undefined;
    }
  }, []);

  const signOut = useCallback(async () => {
    window.clearTimeout(refreshTimer.current);
    if (accessToken) await revokeAccessToken(accessToken);
    setAccessToken(undefined);
    setError(undefined);
    setStatus(AuthStatus.SignedOut);
  }, [accessToken]);

  useEffect(() => () => window.clearTimeout(refreshTimer.current), []);

  return (
    <AuthContext.Provider value={{ accessToken, error, signIn, signOut, status }}>
      {children}
    </AuthContext.Provider>
  );
};
