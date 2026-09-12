const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;

let pickerApiLoaded = false;

const loadPickerApi = (): Promise<void> => {
  if (pickerApiLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timeoutMs = 10_000;

    const waitForGapi = () => {
      if (window.gapi) {
        window.gapi.load('picker', () => {
          pickerApiLoaded = true;
          resolve();
        });
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Google API loader (gapi) failed to load.'));
        return;
      }
      window.setTimeout(waitForGapi, 100);
    };

    waitForGapi();
  });
};

export interface PickedSheet {
  id: string;
  name: string;
}

export const pickSheet = async (accessToken: string): Promise<PickedSheet | undefined> => {
  if (!API_KEY) {
    throw new Error('Missing VITE_GOOGLE_API_KEY. Set it in your .env file (see spec.md §4.1).');
  }

  await loadPickerApi();
  const picker = window.google!.picker!;

  return new Promise((resolve) => {
    const view = new picker.DocsView(picker.ViewId.SPREADSHEETS)
      .setIncludeFolders(false)
      .setMimeTypes('application/vnd.google-apps.spreadsheet')
      .setSelectFolderEnabled(false);

    const builder = new picker.PickerBuilder()
      .addView(view)
      .setCallback((data) => {
        if (data.action === picker.Action.CANCEL) {
          resolve(undefined);
          return;
        }
        if (data.action !== picker.Action.PICKED) return;
        const doc = data.docs?.[0];
        resolve(doc ? { id: doc.id, name: doc.name } : undefined);
      })
      .setDeveloperKey(API_KEY)
      .setOAuthToken(accessToken)
      .setOrigin(window.location.origin);

    builder.build().setVisible(true);
  });
};
