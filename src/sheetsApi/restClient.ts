
import { SheetsApiError } from './errors';

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const INITIAL_RETRY_DELAY_MS = 500;
const MAX_ATTEMPTS = 3;
const TEMPORARY_FAILURE_MESSAGE =
  'Google Sheets לא זמין כרגע. אפשר לנסות שוב בעוד רגע.';

export type SheetCellValue = boolean | number | string;

const wait = (delayMs: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });

const isRetryableStatus = (status: number) => status === 429 || status >= 500;

const getRetryDelayMs = (attemptIndex: number) => {
  const baseDelay = INITIAL_RETRY_DELAY_MS * 2 ** attemptIndex;
  const jitter = Math.floor(Math.random() * 200);
  return baseDelay + jitter;
};

const request = async <T>(accessToken: string, path: string, init?: RequestInit): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('Content-Type', 'application/json');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers,
      });
    } catch (requestError) {
      throw new SheetsApiError(
        requestError instanceof Error
          ? requestError.message
          : 'שגיאת רשת בפנייה ל-Google Sheets.',
      );
    }

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    const body = await response.text().catch(() => '');
    if (attempt < MAX_ATTEMPTS && isRetryableStatus(response.status)) {
      await wait(getRetryDelayMs(attempt - 1));
      continue;
    }

    throw new SheetsApiError(
      isRetryableStatus(response.status)
        ? TEMPORARY_FAILURE_MESSAGE
        : `Sheets API request failed (${response.status.toString()}): ${body}`,
      response.status,
    );
  }

  throw new SheetsApiError(TEMPORARY_FAILURE_MESSAGE);
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
    sheetId?: number;
    startColumnIndex?: number;
    startRowIndex?: number;
  };
}

export interface SpreadsheetMeta {
  sheets: { properties: SheetProperties }[];
  namedRanges?: NamedRange[];
}

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
  // Keep Sheets' default SERIAL_NUMBER date output; formatted strings are locale-ambiguous.
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

export const spreadsheetsBatchUpdate = (
  accessToken: string,
  spreadsheetId: string,
  requests: object[],
): Promise<unknown> =>
  request(accessToken, `/${spreadsheetId}:batchUpdate`, {
    body: JSON.stringify({ requests }),
    method: 'POST',
  });
