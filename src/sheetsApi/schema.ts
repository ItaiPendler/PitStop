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

export interface FuelEntryValues {
  date: string;
  liters: number;
  odometerKm: number;
  notes?: string;
  pricePerLiter?: number;
  totalPrice?: number;
}

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
