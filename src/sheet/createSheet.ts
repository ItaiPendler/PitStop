/**
 * Creates a brand-new, blank Google Sheet via the Sheets API, for the
 * "create a new PitStop sheet" onboarding path. Actually populating it with
 * the car-info/fuel-log structure (spec.md §6.1/§6.4) is the job of the
 * upcoming sheets-client layer — this just gets a fresh spreadsheet id.
 */
export interface CreatedSheet {
  id: string;
  name: string;
}

export const createSheet = async (accessToken: string, title: string): Promise<CreatedSheet> => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    body: JSON.stringify({ properties: { title } }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to create spreadsheet (${response.status}).`);
  }

  const data = (await response.json()) as {
    properties?: { title?: string };
    spreadsheetId?: string;
  };

  if (!data.spreadsheetId) {
    throw new Error('Spreadsheet creation response was missing an id.');
  }

  return { id: data.spreadsheetId, name: data.properties?.title ?? title };
};
