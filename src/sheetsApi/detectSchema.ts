import { SchemaError, SchemaErrorReason } from './errors';
import {
  FUEL_LOG_FIRST_DATA_ROW,
  MARKER_ROW,
  NAMED_RANGE_CAR_INFO,
  NAMED_RANGE_FUEL_LOG,
  SCHEMA_MARKER_LABEL,
  SCHEMA_VERSION,
  quoteSheetTitle,
} from './schema';
import { getSpreadsheetMeta, valuesGet, type NamedRange, type SheetProperties } from './restClient';

export interface EmptyTab {
  sheetId: number;
  status: 'empty';
}

export interface ValidTab {
  sheetId: number;
  status: 'valid';
}

export type TabSchemaStatus = EmptyTab | ValidTab;

const findSheetByTitle = (
  sheets: { properties: SheetProperties }[],
  title: string,
): SheetProperties => {
  const match = sheets.find((sheet) => sheet.properties.title === title);
  if (!match) throw new Error(`No tab named "${title}" was found in this spreadsheet.`);
  return match.properties;
};

const hasNamedRange = (namedRanges: NamedRange[], name: string, sheetId: number): boolean =>
  // The API omits sheetId when it is 0, so treat a missing value as 0.
  namedRanges.some((range) => range.name === name && (range.range.sheetId ?? 0) === sheetId);

export const detectTabSchema = async (
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
): Promise<TabSchemaStatus> => {
  const meta = await getSpreadsheetMeta(accessToken, spreadsheetId);
  const { sheetId } = findSheetByTitle(meta.sheets, sheetTitle);
  const quotedTitle = quoteSheetTitle(sheetTitle);

  const markerRow = await valuesGet(
    accessToken,
    spreadsheetId,
    `${quotedTitle}!A${MARKER_ROW.toString()}:B${MARKER_ROW.toString()}`,
  );
  const [marker, version] = markerRow[0] ?? [];

  if (!marker) {
    const sample = await valuesGet(
      accessToken,
      spreadsheetId,
      `${quotedTitle}!A1:G${FUEL_LOG_FIRST_DATA_ROW.toString()}`,
    );
    const hasAnyContent = sample.some((row) => row.some((cell) => cell !== '' && cell != null));
    if (hasAnyContent) {
      throw new SchemaError(
        `Tab "${sheetTitle}" has content but no PitStop marker — refusing to overwrite it.`,
        SchemaErrorReason.UnrecognizedContent,
      );
    }
    return { sheetId, status: 'empty' };
  }

  const namedRanges = meta.namedRanges ?? [];
  const carInfoOk = hasNamedRange(namedRanges, NAMED_RANGE_CAR_INFO, sheetId);
  const fuelLogOk = hasNamedRange(namedRanges, NAMED_RANGE_FUEL_LOG, sheetId);

  if (
    marker !== SCHEMA_MARKER_LABEL ||
    Number(version) !== SCHEMA_VERSION ||
    !carInfoOk ||
    !fuelLogOk
  ) {
    throw new SchemaError(
      `Tab "${sheetTitle}" has a PitStop marker but its structure doesn't match — it may have been edited by hand.`,
      SchemaErrorReason.VersionMismatch,
    );
  }

  return { sheetId, status: 'valid' };
};
