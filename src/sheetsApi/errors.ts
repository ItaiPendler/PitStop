/**
 * Error types for the Sheets API client layer. Callers (data-models,
 * dashboard-wired, etc.) can `instanceof`-check these to show the right
 * message — e.g. `SchemaError` maps to the "repair structure" action from
 * spec.md §6.4, while `SheetsApiError` is a plain REST/network failure.
 */
export class SheetsApiError extends Error {
  status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'SheetsApiError';
    this.status = status;
  }
}

export enum SchemaErrorReason {
  UnrecognizedContent = 'unrecognized-content',
  VersionMismatch = 'version-mismatch',
}

export class SchemaError extends Error {
  reason: SchemaErrorReason;

  constructor(message: string, reason: SchemaErrorReason) {
    super(message);
    this.name = 'SchemaError';
    this.reason = reason;
  }
}
