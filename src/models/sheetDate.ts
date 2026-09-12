import type { SheetCellValue } from '../sheetsApi';

// Google Sheets day 0 is 1899-12-30.
const SERIAL_DATE_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const parseSheetDate = (value: SheetCellValue): string => {
  if (typeof value === 'number') {
    return new Date(SERIAL_DATE_EPOCH_MS + value * MS_PER_DAY).toISOString().slice(0, 10);
  }
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? text : parsed.toISOString().slice(0, 10);
};

export const formatDateForSheet = (isoDate: string): string => isoDate;
