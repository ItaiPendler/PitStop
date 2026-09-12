/**
 * Thin fetch wrapper around the Sheets API v4 REST endpoints used by
 * PitStop. No client library — spec.md §4.1 keeps the app dependency-light
 * and everything auths with the bearer access token from `useAuth()`.
 */
import { SheetsApiError } from './errors';

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

export type SheetCellValue = boolean | number | string;

const request = async <T>(accessToken: string, path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new SheetsApiError(
      `Sheets API request failed (${response.status.toString()}): ${body}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
};

export interface SheetProperties {
  sheetId: number;
  title: string;
}

export interface NamedRange {
  name: string;
  namedRangeId: string;
  range: {
    endColumnIndex?: number;
    endRowIndex?: number;
    // Omitted by the API when it's `0` — see the comment at `hasNamedRange`
    // in detectSchema.ts for why callers must not compare this directly.
    sheetId?: number;
    startColumnIndex?: number;
    startRowIndex?: number;
  };
}

export interface SpreadsheetMeta {
  sheets: { properties: SheetProperties }[];
  namedRanges?: NamedRange[];
}

/** Fetches sheet titles/ids and named ranges for the whole spreadsheet. */
export const getSpreadsheetMeta = (
  accessToken: string,
  spreadsheetId: string,
): Promise<SpreadsheetMeta> =>
  request<SpreadsheetMeta>(
    accessToken,
    `/${spreadsheetId}?fields=${encodeURIComponent('sheets.properties,namedRanges')}`,
  );

export interface ValueRange {
  range: string;
  values?: SheetCellValue[][];
}

export const valuesGet = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
): Promise<SheetCellValue[][]> => {
  // Deliberately omit `dateTimeRenderOption` so it keeps the API default of
  // `SERIAL_NUMBER`: date cells come back as plain numbers (days since
  // 1899-12-30), the same units as every other numeric cell. The
  // alternative, `FORMATTED_STRING`, renders dates using the spreadsheet's
  // locale-dependent number format (e.g. `M/d/yyyy` vs `d/M/yyyy`), which is
  // ambiguous to parse back out reliably — see `src/models` for the serial
  // <-> ISO-date conversion this relies on.
  const data = await request<ValueRange>(
    accessToken,
    `/${spreadsheetId}/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`,
  );
  return data.values ?? [];
};

export const valuesUpdate = (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (number | string)[][],
): Promise<unknown> =>
  request(
    accessToken,
    `/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    { body: JSON.stringify({ range, values }), method: 'PUT' },
  );

export interface ValuesBatchUpdateResult {
  responses: { updatedRange?: string }[];
}

export const valuesBatchUpdate = (
  accessToken: string,
  spreadsheetId: string,
  data: { range: string; values: (number | string)[][] }[],
): Promise<ValuesBatchUpdateResult> =>
  request(accessToken, `/${spreadsheetId}/values:batchUpdate`, {
    body: JSON.stringify({ data, valueInputOption: 'USER_ENTERED' }),
    method: 'POST',
  });

export interface ValuesAppendResult {
  updates: { updatedRange: string };
}

export const valuesAppend = (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (number | string)[][],
): Promise<ValuesAppendResult> =>
  request(
    accessToken,
    `/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { body: JSON.stringify({ range, values }), method: 'POST' },
  );

/** Generic `spreadsheets.batchUpdate` — for named ranges, renames, row deletes. */
export const spreadsheetsBatchUpdate = (
  accessToken: string,
  spreadsheetId: string,
  requests: object[],
): Promise<unknown> =>
  request(accessToken, `/${spreadsheetId}:batchUpdate`, {
    body: JSON.stringify({ requests }),
    method: 'POST',
  });
