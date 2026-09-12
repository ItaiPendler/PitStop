export const SCHEMA_MARKER_LABEL = 'PitStop';
export const SCHEMA_VERSION = 1;

export const MARKER_ROW = 1;
export const CAR_INFO_LABEL_ROW = 3;
export const CAR_INFO_FIRST_ROW = 4;
export const CAR_INFO_LAST_ROW = 10;
export const FUEL_LOG_HEADER_ROW = 12;
export const FUEL_LOG_FIRST_DATA_ROW = 13;

export const FUEL_LOG_LAST_ROW = 999;

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

export const CAR_INFO_ROW_LABELS: { key: keyof CarInfoFields; label: string }[] = [
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Year' },
  { key: 'licensePlate', label: 'License plate' },
  { key: 'nickname', label: 'Nickname' },
  { key: 'tankCapacityL', label: 'Tank capacity (L)' },
  { key: 'initialOdometerKm', label: 'Initial odometer' },
];

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
  efficiencyKmPerLiter?: number;
  notes?: string;
  pricePerLiter?: number;
  totalPrice?: number;
}

// Google Sheets day 0 is 1899-12-30.
const SERIAL_DATE_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const serialDateToIso = (value: string | number): string => {
  if (typeof value === 'string') return value;
  const ms = SERIAL_DATE_EPOCH_MS + value * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10);
};

export const isoDateToSerial = (iso: string): number => {
  const ms = Date.parse(`${iso}T00:00:00Z`);
  return Math.round((ms - SERIAL_DATE_EPOCH_MS) / MS_PER_DAY);
};

export const quoteSheetTitle = (title: string): string => `'${title.replace(/'/g, "''")}'`;

// Bootstrap writes this once; Sheets keeps later rows calculated.
export const buildEfficiencyArrayFormula = (): string => {
  const first = FUEL_LOG_FIRST_DATA_ROW;
  const last = FUEL_LOG_LAST_ROW;
  const prevFirst = first - 1;
  const prevLast = last - 1;
  return (
    `=ARRAYFORMULA(IF(ROW(B${first}:B${last})=${first},"",` +
    `IF((B${first}:B${last}="")+(B${prevFirst}:B${prevLast}="")+(C${first}:C${last}=0),"",` +
    `(B${first}:B${last}-B${prevFirst}:B${prevLast})/C${first}:C${last})))`
  );
};

// Keep price-per-liter sheet-driven for rows added in or outside the app.
export const buildPricePerLiterArrayFormula = (): string => {
  const first = FUEL_LOG_FIRST_DATA_ROW;
  const last = FUEL_LOG_LAST_ROW;
  return (
    `=ARRAYFORMULA(IF((D${first}:D${last}="")+(C${first}:C${last}=0),"",` +
    `TRUNC(D${first}:D${last}/C${first}:C${last},2)))`
  );
};
