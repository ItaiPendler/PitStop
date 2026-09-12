/**
 * Detects whether a car tab is empty (safe to bootstrap), already has a
 * valid PitStop structure (safe to read), or is malformed (needs the
 * "repair structure" path) — spec.md §6.4.
 */
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
  namedRanges.some((range) => range.name === name && range.range.sheetId === sheetId);

/**
 * Reads the tab's marker cell + named ranges and classifies it. Throws a
 * `SchemaError` for content that doesn't match a fresh or valid PitStop tab,
 * so callers can surface the "repair structure" error path.
 */
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
    // No schema marker — make sure the tab is actually blank before we call
    // it "empty", so we never silently overwrite hand-entered data.
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
