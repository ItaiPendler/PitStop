/**
 * The fixed per-car tab layout from spec.md §6.1/§6.2 — one source of truth
 * for every row/column index so a future layout change only needs edits
 * here, not scattered through the client.
 */

export const SCHEMA_MARKER_LABEL = 'PitStop';
export const SCHEMA_VERSION = 1;

// 1-based row numbers, matching the sheet as a human would read it.
export const MARKER_ROW = 1;
export const CAR_INFO_LABEL_ROW = 3;
export const CAR_INFO_FIRST_ROW = 4;
export const CAR_INFO_LAST_ROW = 10;
export const FUEL_LOG_HEADER_ROW = 12;
export const FUEL_LOG_FIRST_DATA_ROW = 13;

export const NAMED_RANGE_CAR_INFO = 'CarInfo';
export const NAMED_RANGE_FUEL_LOG = 'FuelLog';

export interface CarInfoFields {
  licensePlate: string;
  make: string;
  model: string;
  nickname: string;
  year: number;
  initialOdometerKm?: number;
  tankCapacityL?: number;
}

// Order here fixes the row order of the CarInfo block (rows 4-10).
export const CAR_INFO_ROW_LABELS: { key: keyof CarInfoFields; label: string }[] = [
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Year' },
  { key: 'licensePlate', label: 'License plate' },
  { key: 'nickname', label: 'Nickname' },
  { key: 'tankCapacityL', label: 'Tank capacity (L)' },
  { key: 'initialOdometerKm', label: 'Initial odometer' },
];

// Column A-G header labels for the fuel-log table (row 12).
export const FUEL_LOG_HEADER = [
  'Date',
  'Odometer (km)',
  'Liters',
  'Total ₪',
  'Price / L (₪)',
  'Efficiency (km/L)',
  'Notes',
];

// Column A (date) is always read back as a `string` here — see
// `serialDateToIso`/`isoDateToSerial` below for how the raw Sheets serial
// number gets converted at the read/write boundary.
export interface FuelEntryValues {
  date: string;
  liters: number;
  odometerKm: number;
  efficiencyKmPerLiter?: number;
  notes?: string;
  pricePerLiter?: number;
  totalPrice?: number;
}

// Google Sheets' serial-date epoch: day 0 is 1899-12-30 (not 1900-01-01 —
// Sheets/Excel keep a fictitious 1900-02-29 in the count).
const SERIAL_DATE_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Converts a Sheets date serial number (returned by `valuesGet`, which reads
 * `UNFORMATTED_VALUE`/`SERIAL_NUMBER`) into an ISO `'YYYY-MM-DD'` string.
 * Accepts an already-ISO string unchanged so callers can pass either shape
 * safely (e.g. a cell that was left as text by a manual edit).
 */
export const serialDateToIso = (value: string | number): string => {
  if (typeof value === 'string') return value;
  const ms = SERIAL_DATE_EPOCH_MS + value * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10);
};

/**
 * The inverse of `serialDateToIso`, used only if a caller needs the raw
 * numeric serial (writes go through `valueInputOption=USER_ENTERED` instead,
 * which parses a plain ISO string directly, so this isn't needed there).
 */
export const isoDateToSerial = (iso: string): number => {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Math.round((ms - SERIAL_DATE_EPOCH_MS) / MS_PER_DAY);
};

/** Escapes a sheet title for use inside A1-notation ranges. */
export const quoteSheetTitle = (title: string): string => `'${title.replace(/'/g, "''")}'`;

/**
 * The col-F formula for a given 1-based data row: blank on the first data
 * row (no previous odometer to diff against), otherwise
 * `(odometer_now - odometer_prev) / liters_now` — spec.md §7.1.
 */
export const buildEfficiencyFormula = (row: number): string => {
  if (row <= FUEL_LOG_FIRST_DATA_ROW) return '';
  const prev = row - 1;
  return `=IF(OR(B${row}="",B${prev}="",C${row}=0),"",(B${row}-B${prev})/C${row})`;
};
