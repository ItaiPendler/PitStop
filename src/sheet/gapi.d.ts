// Minimal ambient types for the Google Picker (`google.picker`) namespace.
// Docs: https://developers.google.com/drive/picker/guides/overview
export interface GooglePickerNamespace {
  Action: { CANCEL: string; PICKED: string };
  DocsView: new (viewId: string) => GooglePickerDocsView;
  Document: { ID: string; NAME: string };
  Feature: { NAV_HIDDEN: string };
  PickerBuilder: new () => GooglePickerBuilder;
  Response: { ACTION: string; DOCUMENTS: string };
  ViewId: { SPREADSHEETS: string };
}

export interface GooglePickerDocsView {
  setIncludeFolders: (include: boolean) => GooglePickerDocsView;
  setMimeTypes: (mimeTypes: string) => GooglePickerDocsView;
  setSelectFolderEnabled: (enabled: boolean) => GooglePickerDocsView;
}

export interface GooglePickerBuilder {
  addView: (view: GooglePickerDocsView) => GooglePickerBuilder;
  build: () => GooglePicker;
  enableFeature: (feature: string) => GooglePickerBuilder;
  setCallback: (callback: (data: GooglePickerResponse) => void) => GooglePickerBuilder;
  setDeveloperKey: (key: string) => GooglePickerBuilder;
  setOAuthToken: (token: string) => GooglePickerBuilder;
  setOrigin: (origin: string) => GooglePickerBuilder;
}

export interface GooglePicker {
  setVisible: (visible: boolean) => void;
}

export interface GooglePickerDocument {
  id: string;
  name: string;
}

export interface GooglePickerResponse {
  action: string;
  docs?: GooglePickerDocument[];
}
