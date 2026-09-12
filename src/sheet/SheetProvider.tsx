import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { SheetContext, type ConnectedSheet } from './context';
import { createSheet } from './createSheet';
import { pickSheet } from './pickerClient';

const STORAGE_KEY = 'pitstop:sheet';

const readStoredSheet = (): ConnectedSheet | undefined => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<ConnectedSheet>;
    if (!parsed.id || !parsed.name) return undefined;
    return { id: parsed.id, name: parsed.name };
  } catch {
    return undefined;
  }
};

const writeStoredSheet = (sheet: ConnectedSheet | undefined) => {
  if (!sheet) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet));
};

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, signIn } = useAuth();
  const [sheet, setSheet] = useState<ConnectedSheet | undefined>(readStoredSheet);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    writeStoredSheet(sheet);
  }, [sheet]);

  const withFreshToken = useCallback(async (): Promise<string> => {
    if (accessToken) return accessToken;
    const token = await signIn();
    if (!token) throw new Error('יש להתחבר עם Google לפני חיבור גיליון.');
    return token;
  }, [accessToken, signIn]);

  const connectExisting = useCallback(async () => {
    setIsBusy(true);
    setError(undefined);
    try {
      const token = await withFreshToken();
      const picked = await pickSheet(token);
      if (picked) setSheet(picked);
    } catch (pickError) {
      setError(pickError instanceof Error ? pickError.message : 'שגיאה בבחירת הגיליון.');
    } finally {
      setIsBusy(false);
    }
  }, [withFreshToken]);

  const createNewSheet = useCallback(
    async (title: string) => {
      setIsBusy(true);
      setError(undefined);
      try {
        const token = await withFreshToken();
        const created = await createSheet(token, title);
        setSheet(created);
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : 'שגיאה ביצירת הגיליון.');
      } finally {
        setIsBusy(false);
      }
    },
    [withFreshToken],
  );

  const disconnect = useCallback(() => {
    setSheet(undefined);
  }, []);

  return (
    <SheetContext.Provider
      value={{ connectExisting, createNew: createNewSheet, disconnect, error, isBusy, sheet }}
    >
      {children}
    </SheetContext.Provider>
  );
};
