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
