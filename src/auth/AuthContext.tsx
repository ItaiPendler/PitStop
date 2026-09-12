import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthContext, type AuthStatus } from './context';
import { requestAccessToken, revokeAccessToken } from './googleTokenClient';

// Refresh the token this many ms before it actually expires, so a write
// request never starts with a token that's about to die mid-flight.
const REFRESH_MARGIN_MS = 60_000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('signed-out');
  const [accessToken, setAccessToken] = useState<string>();
  const [error, setError] = useState<string>();
  const refreshTimer = useRef<number | undefined>(undefined);
  // Holds the "schedule next silent refresh" function. A ref (rather than a
  // plain recursive const) sidesteps the temporal-dead-zone self-reference
  // that a directly-recursive useCallback would create.
  const scheduleRefreshRef = useRef<(expiresInSeconds: number) => void>(() => {});

  useEffect(() => {
    scheduleRefreshRef.current = (expiresInSeconds: number) => {
      window.clearTimeout(refreshTimer.current);
      const delay = Math.max(expiresInSeconds * 1000 - REFRESH_MARGIN_MS, 5_000);
      refreshTimer.current = window.setTimeout(() => {
        requestAccessToken({ prompt: '' })
          .then((response) => {
            setAccessToken(response.access_token);
            scheduleRefreshRef.current(response.expires_in);
          })
          .catch(() => {
            // Silent refresh failed (e.g. session revoked elsewhere) — fall
            // back to requiring an explicit sign-in again.
            setStatus('signed-out');
            setAccessToken(undefined);
          });
      }, delay);
    };
  }, []);

  const signIn = useCallback(async () => {
    setStatus('signing-in');
    setError(undefined);
    try {
      const response = await requestAccessToken({ prompt: 'consent' });
      setAccessToken(response.access_token);
      setStatus('signed-in');
      scheduleRefreshRef.current(response.expires_in);
      return response.access_token;
    } catch (signInError) {
      setStatus('error');
      setError(signInError instanceof Error ? signInError.message : 'שגיאה בהתחברות ל-Google.');
      return undefined;
    }
  }, []);

  const signOut = useCallback(async () => {
    window.clearTimeout(refreshTimer.current);
    if (accessToken) await revokeAccessToken(accessToken);
    setAccessToken(undefined);
    setStatus('signed-out');
  }, [accessToken]);

  // Try a silent (no popup) sign-in once on load, in case the browser still
  // has an active Google session — spares the user a click on every visit.
  useEffect(() => {
    let cancelled = false;
    requestAccessToken({ prompt: '' })
      .then((response) => {
        if (cancelled) return;
        setAccessToken(response.access_token);
        setStatus('signed-in');
        scheduleRefreshRef.current(response.expires_in);
      })
      .catch(() => {
        // No existing session — stay signed out until the user taps "sign in".
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => window.clearTimeout(refreshTimer.current), []);

  return (
    <AuthContext.Provider value={{ accessToken, error, signIn, signOut, status }}>
      {children}
    </AuthContext.Provider>
  );
};
