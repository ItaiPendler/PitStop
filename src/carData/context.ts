import { createContext } from 'react';
import type { Car, FuelEntry } from '../models';

export type CarDataStatus = 'error' | 'idle' | 'loading' | 'needs-setup' | 'ready';

export interface CarDataState {
  addFuelEntry: (
    entry: Omit<FuelEntry, 'efficiencyKmPerLiter' | 'pricePerLiter' | 'row'>,
  ) => Promise<void>;
  car: Car | undefined;
  createCar: (fields: Omit<Car, 'id'>) => Promise<void>;
  deleteFuelEntry: (row: number) => Promise<void>;
  error: string | undefined;
  fuelEntries: FuelEntry[];
  refresh: () => Promise<void>;
  status: CarDataStatus;
  updateCar: (fields: Omit<Car, 'id'>) => Promise<void>;
  updateFuelEntry: (
    row: number,
    entry: Omit<FuelEntry, 'efficiencyKmPerLiter' | 'pricePerLiter' | 'row'>,
  ) => Promise<void>;
}

export const CarDataContext = createContext<CarDataState | undefined>(undefined);
