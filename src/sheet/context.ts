import { createContext } from 'react';

export interface ConnectedSheet {
  id: string;
  name: string;
}

export interface SheetState {
  connectExisting: () => Promise<void>;
  createNew: (title: string) => Promise<void>;
  disconnect: () => void;
  error: string | undefined;
  isBusy: boolean;
  sheet: ConnectedSheet | undefined;
}

export const SheetContext = createContext<SheetState | undefined>(undefined);
