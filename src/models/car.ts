/**
 * The `Car` domain type — a friendly, camelCase view of a car tab's info
 * block (spec.md §6.1/§6.2), distinct from the raw `sheetsApi.CarInfoFields`
 * shape (which mirrors exactly what's written into rows 4-10). `id` is the
 * tab title, which per spec.md §15 decision #4 is always the car's
 * nickname — it's what identifies a car within the spreadsheet, so callers
 * don't have to thread the sheet title and `nickname` around separately.
 */
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

/** Converts a domain `Car` into the raw shape `bootstrapCarTab` writes. */
export const toCarInfoFields = (car: Omit<Car, 'id'>): CarInfoFields => ({
  initialOdometerKm: car.initialOdometerKm,
  licensePlate: car.licensePlate,
  make: car.make,
  model: car.model,
  nickname: car.nickname,
  tankCapacityL: car.tankCapacityL,
  year: car.year,
});

/** Converts the raw CarInfo block (from `getCarInfo`) into a domain `Car`. */
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
