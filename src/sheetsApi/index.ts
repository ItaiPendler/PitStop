export { bootstrapCarTab } from './bootstrapTab';
export { detectTabSchema, type TabSchemaStatus } from './detectSchema';
export { SchemaError, SchemaErrorReason, SheetsApiError } from './errors';
export {
  appendFuelRow,
  deleteFuelRow,
  getFuelLogRows,
  updateFuelRow,
  type FuelLogRow,
} from './fuelRows';
export {
  CAR_INFO_ROW_LABELS,
  FUEL_LOG_HEADER,
  NAMED_RANGE_CAR_INFO,
  NAMED_RANGE_FUEL_LOG,
  SCHEMA_MARKER_LABEL,
  SCHEMA_VERSION,
  type CarInfoFields,
  type FuelEntryValues,
} from './schema';
