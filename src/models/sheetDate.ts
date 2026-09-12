/**
 * Date conversion helpers for the boundary between the Sheets API and the
 * domain model. `sheetsApi.getFuelLogRows` already normalizes column A into
 * an ISO `'YYYY-MM-DD'` string (see `serialDateToIso` in
 * `sheetsApi/schema.ts`), so in the happy path `parseSheetDate` is a
 * pass-through. It stays defensive against a raw numeric serial (a
 * `SheetCellValue`, not just a `string`) reaching this layer anyway — e.g.
 * a future direct read that forgets the conversion, or a stray value left
 * by manual sheet editing — so a caller here never has to special-case it.
 */
import type { SheetCellValue } from '../sheetsApi';

const SERIAL_DATE_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Normalizes a raw Sheets cell value for column A into an ISO `'YYYY-MM-DD'` date string. */
export const parseSheetDate = (value: SheetCellValue): string => {
  if (typeof value === 'number') {
    return new Date(SERIAL_DATE_EPOCH_MS + value * MS_PER_DAY).toISOString().slice(0, 10);
  }
  const text = String(value ?? '').trim();
  if (!text) return '';
  // Already ISO (or ISO-prefixed, e.g. a full timestamp) — keep as-is.
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  // Fall back to the platform date parser for any other stringly date
  // representation (best-effort; ISO in, ISO out is the supported path).
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? text : parsed.toISOString().slice(0, 10);
};

/**
 * Prepares an ISO `'YYYY-MM-DD'` string for a Sheets write. ISO dates are
 * parsed unambiguously by Sheets under `valueInputOption=USER_ENTERED`
 * regardless of spreadsheet locale, so no conversion is needed — this just
 * documents/asserts the contract at the call site.
 */
export const formatDateForSheet = (isoDate: string): string => isoDate;
