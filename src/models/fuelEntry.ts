/**
 * The `FuelEntry` domain type — a friendly, camelCase view of one fuel-log
 * row (spec.md §6.1/§6.2), distinct from the raw `sheetsApi.FuelEntryValues`
 * shape. `row` carries the 1-based sheet row so a future edit/delete can
 * target this exact entry via `updateFuelRow`/`deleteFuelRow` without
 * re-deriving it.
 */
import { formatDateForSheet, parseSheetDate } from './sheetDate';
import type { FuelEntryValues, FuelLogRow } from '../sheetsApi';

export interface FuelEntry {
  date: string;
  liters: number;
  odometerKm: number;
  row: number;
  efficiencyKmPerLiter?: number;
  notes?: string;
  pricePerLiter?: number;
  totalPrice?: number;
}

/** Converts a domain `FuelEntry` (minus the sheet-computed/row fields) into the raw write shape. */
export const toFuelEntryValues = (
  entry: Omit<FuelEntry, 'efficiencyKmPerLiter' | 'row'>,
): FuelEntryValues => ({
  date: formatDateForSheet(entry.date),
  liters: entry.liters,
  notes: entry.notes,
  odometerKm: entry.odometerKm,
  pricePerLiter: entry.pricePerLiter,
  totalPrice: entry.totalPrice,
});

/** Converts a raw fuel-log row (from `getFuelLogRows`) into a domain `FuelEntry`. */
export const fromFuelLogRow = ({ row, values }: FuelLogRow): FuelEntry => ({
  date: parseSheetDate(values.date),
  efficiencyKmPerLiter: values.efficiencyKmPerLiter,
  liters: values.liters,
  notes: values.notes,
  odometerKm: values.odometerKm,
  pricePerLiter: values.pricePerLiter,
  row,
  totalPrice: values.totalPrice,
});
