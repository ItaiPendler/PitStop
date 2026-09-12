import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthStatus, useAuth } from '../auth';
import {
  fromCarInfoFields,
  fromFuelLogRow,
  toCarInfoFields,
  toFuelEntryValues,
  type Car,
  type FuelEntry,
} from '../models';
import { useSheet } from '../sheet';
import {
  SchemaError,
  appendFuelRow,
  bootstrapCarTab,
  deleteFuelRow,
  detectTabSchema,
  getCarInfo,
  getFuelLogRows,
  updateCarInfo,
  updateFuelRow,
} from '../sheetsApi';
import { getSpreadsheetMeta } from '../sheetsApi/restClient';
import { CarDataContext, type CarDataState, type CarDataStatus } from './context';

const GENERIC_ERROR_MESSAGE = 'שגיאה בטעינת נתוני הרכב מהגיליון.';
const SCHEMA_ERROR_MESSAGE =
  'מבנה הלשונית הזו לא תואם את הפורמט של PitStop — כנראה שנערכה ידנית. תיקון מבנה אוטומטי עדיין לא נתמך.';

interface CurrentTab {
  sheetId: number;
  sheetTitle: string;
}

/**
 * Resolves "which tab is the current car" — spec.md notes cars are separate
 * tabs in the same spreadsheet, but there's no multi-car switching UI yet.
 * For now we always use the spreadsheet's first tab (by sheet order); real
 * tab selection is future work once a "switch cars" UI exists.
 */
const resolveCurrentTab = async (
  accessToken: string,
  spreadsheetId: string,
): Promise<CurrentTab> => {
  const meta = await getSpreadsheetMeta(accessToken, spreadsheetId);
  const [firstSheet] = meta.sheets;
  if (!firstSheet) throw new Error('הגיליון המחובר ריק — לא נמצאה בו אף לשונית.');
  return { sheetId: firstSheet.properties.sheetId, sheetTitle: firstSheet.properties.title };
};

export const CarDataProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, signIn, status: authStatus } = useAuth();
  const { sheet } = useSheet();
  const [status, setStatus] = useState<CarDataStatus>('idle');
  const [car, setCar] = useState<Car>();
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([]);
  const [error, setError] = useState<string>();
  // The tab currently backing `car`/`fuelEntries`, so mutations know which
  // sheetId/title to target without re-resolving it on every call.
  const currentTabRef = useRef<CurrentTab | undefined>(undefined);

  const withFreshToken = useCallback(async (): Promise<string> => {
    if (accessToken) return accessToken;
    // Per spec.md §9/§15, PitStop never keeps an offline view — every data
    // operation needs a live token, so prompt sign-in inline if it's gone.
    const token = await signIn();
    if (!token) throw new Error('יש להתחבר עם Google כדי לטעון את נתוני הרכב.');
    return token;
  }, [accessToken, signIn]);

  const refresh = useCallback(async () => {
    if (authStatus !== AuthStatus.SignedIn || !sheet) {
      currentTabRef.current = undefined;
      setStatus('idle');
      setCar(undefined);
      setFuelEntries([]);
      setError(undefined);
      return;
    }

    setStatus('loading');
    setError(undefined);
    try {
      const token = await withFreshToken();
      const tab = await resolveCurrentTab(token, sheet.id);
      currentTabRef.current = tab;

      const schema = await detectTabSchema(token, sheet.id, tab.sheetTitle);
      if (schema.status === 'empty') {
        setCar(undefined);
        setFuelEntries([]);
        setStatus('needs-setup');
        return;
      }

      const [carInfo, fuelRows] = await Promise.all([
        getCarInfo(token, sheet.id, tab.sheetTitle),
        getFuelLogRows(token, sheet.id, tab.sheetTitle),
      ]);
      setCar(fromCarInfoFields(carInfo, tab.sheetTitle));
      setFuelEntries(fuelRows.map(fromFuelLogRow));
      setStatus('ready');
    } catch (fetchError) {
      setError(
        fetchError instanceof SchemaError
          ? SCHEMA_ERROR_MESSAGE
          : fetchError instanceof Error
            ? fetchError.message
            : GENERIC_ERROR_MESSAGE,
      );
      setStatus('error');
    }
  }, [authStatus, sheet, withFreshToken]);

  useEffect(() => {
    // Deferred via setTimeout (rather than calling `refresh()` directly) so
    // its setState calls run outside the synchronous effect flush — see
    // eslint-plugin-react-hooks' `set-state-in-effect` rule.
    const timeoutId = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  const createCar = useCallback(
    async (fields: Omit<Car, 'id'>) => {
      const tab = currentTabRef.current;
      if (!sheet || !tab) throw new Error('לא נמצאה לשונית פעילה ליצירת רכב.');
      try {
        const token = await withFreshToken();
        await bootstrapCarTab({
          accessToken: token,
          carInfo: toCarInfoFields(fields),
          sheetId: tab.sheetId,
          sheetTitle: tab.sheetTitle,
          spreadsheetId: sheet.id,
        });
        await refresh();
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : 'שגיאה ביצירת הרכב בגיליון.');
        throw createError;
      }
    },
    [refresh, sheet, withFreshToken],
  );

  const addFuelEntry = useCallback(
    async (entry: Omit<FuelEntry, 'efficiencyKmPerLiter' | 'pricePerLiter' | 'row'>) => {
      const tab = currentTabRef.current;
      if (!sheet || !tab) throw new Error('לא נמצאה לשונית רכב פעילה.');
      const previousFuelEntries = fuelEntries;
      const optimisticRow =
        Math.max(0, ...previousFuelEntries.map((fuelEntry) => fuelEntry.row)) + 1;
      setError(undefined);
      setFuelEntries([
        ...previousFuelEntries,
        {
          ...entry,
          row: optimisticRow,
        },
      ]);
      try {
        const token = await withFreshToken();
        await appendFuelRow(token, sheet.id, tab.sheetTitle, toFuelEntryValues(entry));
        await refresh();
      } catch (addError) {
        setFuelEntries(previousFuelEntries);
        setError(addError instanceof Error ? addError.message : 'שגיאה בהוספת תדלוק.');
        throw addError;
      }
    },
    [fuelEntries, refresh, sheet, withFreshToken],
  );

  const updateFuelEntry = useCallback(
    async (
      row: number,
      entry: Omit<FuelEntry, 'efficiencyKmPerLiter' | 'pricePerLiter' | 'row'>,
    ) => {
      const tab = currentTabRef.current;
      if (!sheet || !tab) throw new Error('לא נמצאה לשונית רכב פעילה.');
      const previousFuelEntries = fuelEntries;
      setError(undefined);
      setFuelEntries(
        previousFuelEntries.map((fuelEntry) =>
          fuelEntry.row === row ? { ...fuelEntry, ...entry } : fuelEntry,
        ),
      );
      try {
        const token = await withFreshToken();
        await updateFuelRow(token, sheet.id, tab.sheetTitle, row, toFuelEntryValues(entry));
        await refresh();
      } catch (updateError) {
        setFuelEntries(previousFuelEntries);
        setError(updateError instanceof Error ? updateError.message : 'שגיאה בעדכון תדלוק.');
        throw updateError;
      }
    },
    [fuelEntries, refresh, sheet, withFreshToken],
  );

  const updateCar = useCallback(
    async (fields: Omit<Car, 'id'>) => {
      const tab = currentTabRef.current;
      if (!sheet || !tab) throw new Error('לא נמצאה לשונית פעילה לעדכון הרכב.');
      try {
        const token = await withFreshToken();
        await updateCarInfo(token, sheet.id, tab.sheetTitle, toCarInfoFields(fields));
        await refresh();
      } catch (updateError) {
        setError(updateError instanceof Error ? updateError.message : 'שגיאה בעדכון פרטי הרכב.');
        throw updateError;
      }
    },
    [refresh, sheet, withFreshToken],
  );

  const deleteFuelEntry = useCallback(
    async (row: number) => {
      const tab = currentTabRef.current;
      if (!sheet || !tab) throw new Error('לא נמצאה לשונית רכב פעילה.');
      const previousFuelEntries = fuelEntries;
      setError(undefined);
      setFuelEntries(previousFuelEntries.filter((fuelEntry) => fuelEntry.row !== row));
      try {
        const token = await withFreshToken();
        await deleteFuelRow(token, sheet.id, tab.sheetId, row);
        await refresh();
      } catch (deleteError) {
        setFuelEntries(previousFuelEntries);
        setError(deleteError instanceof Error ? deleteError.message : 'שגיאה במחיקת תדלוק.');
        throw deleteError;
      }
    },
    [fuelEntries, refresh, sheet, withFreshToken],
  );

  const value: CarDataState = {
    addFuelEntry,
    car,
    createCar,
    deleteFuelEntry,
    error,
    fuelEntries,
    refresh,
    status,
    updateCar,
    updateFuelEntry,
  };

  return <CarDataContext.Provider value={value}>{children}</CarDataContext.Provider>;
};
