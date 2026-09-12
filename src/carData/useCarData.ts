import { useContext } from 'react';
import { CarDataContext, type CarDataState } from './context';

export const useCarData = (): CarDataState => {
  const context = useContext(CarDataContext);
  if (!context) throw new Error('useCarData must be used within a CarDataProvider.');
  return context;
};
