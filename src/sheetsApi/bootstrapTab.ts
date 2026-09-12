/**
 * Writes the fixed CarInfo + FuelLog layout into a brand-new, empty tab —
 * schema marker, car-info block, fuel-log header, and the named ranges the
 * rest of the client reads/writes by name. See spec.md §6.1/§6.4.
 */
import {
  CAR_INFO_FIRST_ROW,
  CAR_INFO_LABEL_ROW,
  CAR_INFO_LAST_ROW,
  CAR_INFO_ROW_LABELS,
  FUEL_LOG_HEADER,
  FUEL_LOG_HEADER_ROW,
  MARKER_ROW,
  NAMED_RANGE_CAR_INFO,
  NAMED_RANGE_FUEL_LOG,
  SCHEMA_MARKER_LABEL,
  SCHEMA_VERSION,
  quoteSheetTitle,
  type CarInfoFields,
} from './schema';
import { spreadsheetsBatchUpdate, valuesBatchUpdate } from './restClient';

export interface BootstrapTabInput {
  accessToken: string;
  carInfo: CarInfoFields;
  sheetId: number;
  sheetTitle: string;
  spreadsheetId: string;
}

/**
 * Bootstraps an empty tab. Renames the tab to the car's nickname (spec.md
 * §15 decision #4), then writes the layout and named ranges.
 */
export const bootstrapCarTab = async ({
  accessToken,
  carInfo,
  sheetId,
  sheetTitle,
  spreadsheetId,
}: BootstrapTabInput): Promise<void> => {
  const targetTitle = carInfo.nickname.trim() || sheetTitle;

  if (targetTitle !== sheetTitle) {
    await spreadsheetsBatchUpdate(accessToken, spreadsheetId, [
      {
        updateSheetProperties: {
          fields: 'title',
          properties: { sheetId, title: targetTitle },
        },
      },
    ]);
  }

  const quotedTitle = quoteSheetTitle(targetTitle);
  const carInfoRows = CAR_INFO_ROW_LABELS.map(({ key, label }) => [label, carInfo[key] ?? '']);

  await valuesBatchUpdate(accessToken, spreadsheetId, [
    {
      range: `${quotedTitle}!A${MARKER_ROW.toString()}:B${MARKER_ROW.toString()}`,
      values: [[SCHEMA_MARKER_LABEL, SCHEMA_VERSION]],
    },
    { range: `${quotedTitle}!A${CAR_INFO_LABEL_ROW.toString()}`, values: [['— Car info —']] },
    {
      range: `${quotedTitle}!A${CAR_INFO_FIRST_ROW.toString()}:B${CAR_INFO_LAST_ROW.toString()}`,
      values: carInfoRows,
    },
    {
      range: `${quotedTitle}!A${FUEL_LOG_HEADER_ROW.toString()}:G${FUEL_LOG_HEADER_ROW.toString()}`,
      values: [FUEL_LOG_HEADER],
    },
  ]);

  await spreadsheetsBatchUpdate(accessToken, spreadsheetId, [
    {
      addNamedRange: {
        namedRange: {
          name: NAMED_RANGE_CAR_INFO,
          range: {
            endColumnIndex: 2,
            endRowIndex: CAR_INFO_LAST_ROW,
            sheetId,
            startColumnIndex: 0,
            startRowIndex: CAR_INFO_FIRST_ROW - 1,
          },
        },
      },
    },
    {
      addNamedRange: {
        namedRange: {
          name: NAMED_RANGE_FUEL_LOG,
          range: {
            endColumnIndex: 7,
            sheetId,
            startColumnIndex: 0,
            startRowIndex: FUEL_LOG_HEADER_ROW - 1,
          },
        },
      },
    },
  ]);
};
