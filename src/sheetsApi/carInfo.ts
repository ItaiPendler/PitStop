/**
 * Reads the CarInfo block (rows 4-10, spec.md §6.1) back out of an existing
 * tab. `bootstrapCarTab` only ever writes this block for a fresh tab — this
 * is the read-side counterpart the data-models layer needs to load a `Car`.
 */
import {
  CAR_INFO_FIRST_ROW,
  CAR_INFO_LAST_ROW,
  CAR_INFO_ROW_LABELS,
  quoteSheetTitle,
  type CarInfoFields,
} from './schema';
import { valuesGet, type SheetCellValue } from './restClient';

const parseOptionalNumber = (cell: SheetCellValue | undefined): number | undefined =>
  cell === '' || cell == null ? undefined : Number(cell);

/** Reads and parses the CarInfo block for a car tab. */
export const getCarInfo = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
): Promise<CarInfoFields> => {
  const quotedTitle = quoteSheetTitle(sheetTitle);
  const raw = await valuesGet(
    accessToken,
    spreadsheetId,
    `${quotedTitle}!B${CAR_INFO_FIRST_ROW.toString()}:B${CAR_INFO_LAST_ROW.toString()}`,
  );

  const valueByKey = new Map(CAR_INFO_ROW_LABELS.map(({ key }, index) => [key, raw[index]?.[0]]));

  return {
    initialOdometerKm: parseOptionalNumber(valueByKey.get('initialOdometerKm')),
    licensePlate: String(valueByKey.get('licensePlate') ?? ''),
    make: String(valueByKey.get('make') ?? ''),
    model: String(valueByKey.get('model') ?? ''),
    nickname: String(valueByKey.get('nickname') ?? ''),
    tankCapacityL: parseOptionalNumber(valueByKey.get('tankCapacityL')),
    year: Number(valueByKey.get('year') ?? 0),
  };
};
