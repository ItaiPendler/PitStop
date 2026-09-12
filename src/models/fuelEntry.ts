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

export const toFuelEntryValues = (
  entry: Omit<FuelEntry, 'efficiencyKmPerLiter' | 'pricePerLiter' | 'row'>,
): FuelEntryValues => ({
  date: formatDateForSheet(entry.date),
  liters: entry.liters,
  notes: entry.notes,
  odometerKm: entry.odometerKm,
  totalPrice: entry.totalPrice,
});

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
