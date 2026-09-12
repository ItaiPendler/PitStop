import {
  CAR_INFO_FIRST_ROW,
  CAR_INFO_LAST_ROW,
  CAR_INFO_ROW_LABELS,
  quoteSheetTitle,
  type CarInfoFields,
} from './schema';
import { valuesGet, valuesUpdate, type SheetCellValue } from './restClient';

const parseOptionalNumber = (cell: SheetCellValue | undefined): number | undefined =>
  cell === '' || cell == null ? undefined : Number(cell);

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

export const updateCarInfo = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  fields: CarInfoFields,
): Promise<void> => {
  const quotedTitle = quoteSheetTitle(sheetTitle);
  const values = CAR_INFO_ROW_LABELS.map(({ key }) => [fields[key] ?? '']);

  await valuesUpdate(
    accessToken,
    spreadsheetId,
    `${quotedTitle}!B${CAR_INFO_FIRST_ROW.toString()}:B${CAR_INFO_LAST_ROW.toString()}`,
    values,
  );
};
