/**
 * Reads and writes the fuel-log rows (data rows only, header excluded) for
 * a car tab — append/update/delete a fill-up. Column F (efficiency) is
 * always a formula the sheet computes itself (spec.md §6.2/§7.1).
 */
import {
  FUEL_LOG_FIRST_DATA_ROW,
  quoteSheetTitle,
  serialDateToIso,
  type FuelEntryValues,
} from './schema';
import {
  spreadsheetsBatchUpdate,
  valuesAppend,
  valuesBatchUpdate,
  valuesGet,
  valuesUpdate,
  type SheetCellValue,
} from './restClient';

export interface FuelLogRow {
  row: number;
  values: FuelEntryValues;
}

const toRowValues = (entry: FuelEntryValues): (number | string)[] => [
  entry.date,
  entry.odometerKm,
  entry.liters,
  entry.totalPrice ?? '',
  entry.pricePerLiter ?? '',
  '', // column F is always the ARRAYFORMULA written once at bootstrap — never written here
  entry.notes ?? '',
];

const parseOptionalNumber = (cell: SheetCellValue | undefined): number | undefined =>
  cell === '' || cell == null ? undefined : Number(cell);

const fromRowValues = (raw: SheetCellValue[]): FuelEntryValues => ({
  date: serialDateToIso(raw[0] === '' || raw[0] == null ? '' : (raw[0] as string | number)),
  efficiencyKmPerLiter: parseOptionalNumber(raw[5]),
  liters: Number(raw[2] ?? 0),
  notes: raw[6] === '' || raw[6] == null ? undefined : String(raw[6]),
  odometerKm: Number(raw[1] ?? 0),
  pricePerLiter: parseOptionalNumber(raw[4]),
  totalPrice: parseOptionalNumber(raw[3]),
});

/** Extracts the 1-based row number from an `updates.updatedRange` value like `'Corolla'!A15:G15`. */
const parseRowFromRange = (range: string): number => {
  const match = /![A-Z]+(\d+)/.exec(range);
  const rowNumber = match ? Number(match[1]) : Number.NaN;
  if (Number.isNaN(rowNumber)) {
    throw new Error(`Could not determine the row number from range "${range}".`);
  }
  return rowNumber;
};

/** Reads every populated data row currently in the fuel log, in sheet order. */
export const getFuelLogRows = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
): Promise<FuelLogRow[]> => {
  const quotedTitle = quoteSheetTitle(sheetTitle);
  const raw = await valuesGet(
    accessToken,
    spreadsheetId,
    `${quotedTitle}!A${FUEL_LOG_FIRST_DATA_ROW.toString()}:G`,
  );

  return raw
    .map((cells, index) => ({ row: FUEL_LOG_FIRST_DATA_ROW + index, values: fromRowValues(cells) }))
    .filter(({ values }) => values.date !== '');
};

/**
 * Appends a new fill-up after the last existing row. Writes only columns
 * A-E and G — column F is never touched here, it's covered end-to-end by
 * the single ARRAYFORMULA written into F13 at bootstrap (schema.ts), which
 * also covers rows typed directly into the sheet by hand.
 */
export const appendFuelRow = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  entry: FuelEntryValues,
): Promise<number> => {
  const quotedTitle = quoteSheetTitle(sheetTitle);
  const values = toRowValues(entry);
  const appended = await valuesAppend(
    accessToken,
    spreadsheetId,
    `${quotedTitle}!A${FUEL_LOG_FIRST_DATA_ROW.toString()}:E`,
    [values.slice(0, 5)],
  );
  const row = parseRowFromRange(appended.updates.updatedRange);

  if (values[6] !== '') {
    await valuesUpdate(accessToken, spreadsheetId, `${quotedTitle}!G${row.toString()}`, [
      [values[6]],
    ]);
  }

  return row;
};

/** Overwrites an existing row's data (A-E, G); the efficiency formula in F is left untouched. */
export const updateFuelRow = (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  row: number,
  entry: FuelEntryValues,
): Promise<unknown> => {
  const quotedTitle = quoteSheetTitle(sheetTitle);
  const values = toRowValues(entry);
  return valuesBatchUpdate(accessToken, spreadsheetId, [
    { range: `${quotedTitle}!A${row.toString()}:E${row.toString()}`, values: [values.slice(0, 5)] },
    { range: `${quotedTitle}!G${row.toString()}`, values: [[values[6]]] },
  ]);
};

/**
 * Deletes a fill-up row entirely. Sheets shifts rows below up automatically
 * — including the F-column ARRAYFORMULA's own row-13 blank check, so the
 * new first data row is correctly blanked with no extra repair needed here.
 */
export const deleteFuelRow = (
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  row: number,
): Promise<unknown> =>
  spreadsheetsBatchUpdate(accessToken, spreadsheetId, [
    {
      deleteDimension: {
        range: { dimension: 'ROWS', endIndex: row, sheetId, startIndex: row - 1 },
      },
    },
  ]);
