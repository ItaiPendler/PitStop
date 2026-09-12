import type { CarInfoFields } from '../sheetsApi';

export interface Car {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  nickname: string;
  year: number;
  initialOdometerKm?: number;
  tankCapacityL?: number;
}

export const toCarInfoFields = (car: Omit<Car, 'id'>): CarInfoFields => ({
  initialOdometerKm: car.initialOdometerKm,
  licensePlate: car.licensePlate,
  make: car.make,
  model: car.model,
  nickname: car.nickname,
  tankCapacityL: car.tankCapacityL,
  year: car.year,
});

export const fromCarInfoFields = (fields: CarInfoFields, sheetTitle: string): Car => ({
  id: sheetTitle,
  initialOdometerKm: fields.initialOdometerKm,
  licensePlate: fields.licensePlate,
  make: fields.make,
  model: fields.model,
  nickname: fields.nickname,
  tankCapacityL: fields.tankCapacityL,
  year: fields.year,
});
