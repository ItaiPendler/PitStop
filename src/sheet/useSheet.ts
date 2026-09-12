import { useContext } from 'react';
import { SheetContext, type SheetState } from './context';

export const useSheet = (): SheetState => {
  const context = useContext(SheetContext);
  if (!context) throw new Error('useSheet must be used within a SheetProvider.');
  return context;
};
