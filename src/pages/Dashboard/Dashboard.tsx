import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Chip, FuelRow, Gauge, StatTile, TextInput } from '../../components';
import { useCarData } from '../../carData';
import type { Car, FuelEntry } from '../../models';
import { ROUTES } from '../../app/routes';

const ROLLING_WINDOW_SIZE = 5;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('he', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const formatCurrency = (value: number | undefined) =>
  value === undefined ? '—' : `₪${currencyFormatter.format(value)}`;

const formatKm = (value: number) => numberFormatter.format(Math.round(value));

/** Parses a 'YYYY-MM-DD' domain date as a local calendar date (avoids UTC-parsing off-by-one-day shifts). */
const parseIsoDateLocal = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatEntryDate = (isoDate: string) => dateFormatter.format(parseIsoDateLocal(isoDate));

const byRowAscending = (a: FuelEntry, b: FuelEntry) => a.row - b.row;

/**
 * spec.md §7.2 "robust average" over a window of fill-ups: total distance
 * covered divided by the liters used to cover it, excluding the window's
 * first fill (its liters filled the tank *before* the window started, so
 * it isn't distance the window accounts for).
 */
const computeRobustAverage = (window: FuelEntry[]): number | undefined => {
  if (window.length < 2) return undefined;
  const first = window[0];
  const last = window[window.length - 1];
  const litersAfterFirst = window.slice(1).reduce((sum, entry) => sum + entry.liters, 0);
  if (litersAfterFirst <= 0) return undefined;
  return (last.odometerKm - first.odometerKm) / litersAfterFirst;
};

/** Calibrates gauge min/max from historical efficiency readings instead of hardcoded bounds. */
const computeGaugeRange = (efficiencies: number[]): { max: number; min: number } => {
  const minEff = Math.min(...efficiencies);
  const maxEff = Math.max(...efficiencies);
  const spread = maxEff - minEff;
  const padding = Math.max(spread * 0.15, 1.5);
  return { max: Math.ceil(maxEff + padding), min: Math.max(0, Math.floor(minEff - padding)) };
};

/** Total km driven this calendar year: sum of odometer deltas whose *later* fill date falls this year. */
const computeKmThisYear = (chronological: FuelEntry[]): number | undefined => {
  const currentYear = new Date().getFullYear();
  let total: number | undefined;
  for (let i = 1; i < chronological.length; i += 1) {
    const current = chronological[i];
    const previous = chronological[i - 1];
    if (parseIsoDateLocal(current.date).getFullYear() === currentYear) {
      total = (total ?? 0) + (current.odometerKm - previous.odometerKm);
    }
  }
  return total;
};

/**
 * spec.md §7.3 "Cost per 100 km" — lifetime figure: sum of totalPrice over
 * every fill that has both a price and a valid odometer delta from the
 * previous fill, divided by the total km covered by that same set of fills,
 * times 100. Fills missing a price (or the very first fill, which has no
 * prior odometer) are excluded from both the numerator and denominator so
 * the ratio stays consistent.
 */
const computeCostPer100Km = (chronological: FuelEntry[]): number | undefined => {
  let costSum = 0;
  let kmSum = 0;
  for (let i = 1; i < chronological.length; i += 1) {
    const current = chronological[i];
    const previous = chronological[i - 1];
    const delta = current.odometerKm - previous.odometerKm;
    if (current.totalPrice !== undefined && delta > 0) {
      costSum += current.totalPrice;
      kmSum += delta;
    }
  }
  return kmSum > 0 ? (costSum / kmSum) * 100 : undefined;
};

const LoadingState = () => (
  <div className="flex flex-1 items-center justify-center py-16">
    <p className="text-sm text-on-surface-variant">טוען נתונים…</p>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Card className="flex flex-col gap-4">
    <p className="text-sm text-on-surface">{message}</p>
    <Button onClick={onRetry} type="button">
      נסה שוב
    </Button>
  </Card>
);

interface CarSetupFormState {
  initialOdometerKm: string;
  licensePlate: string;
  make: string;
  model: string;
  nickname: string;
  tankCapacityL: string;
  year: string;
}

const EMPTY_CAR_SETUP_FORM: CarSetupFormState = {
  initialOdometerKm: '',
  licensePlate: '',
  make: '',
  model: '',
  nickname: '',
  tankCapacityL: '',
  year: '',
};

const CarSetupForm = ({ onCreate }: { onCreate: (fields: Omit<Car, 'id'>) => Promise<void> }) => {
  const [form, setForm] = useState<CarSetupFormState>(EMPTY_CAR_SETUP_FORM);
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange =
    (field: keyof CarSetupFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);

    const year = Number(form.year);
    const hasRequiredFields =
      form.make.trim() &&
      form.model.trim() &&
      form.licensePlate.trim() &&
      form.nickname.trim() &&
      form.year.trim() &&
      !Number.isNaN(year);
    if (!hasRequiredFields) {
      setFormError('יש למלא יצרן, דגם, שנה, מספר רישוי וכינוי.');
      return;
    }

    const tankCapacityL = form.tankCapacityL.trim() ? Number(form.tankCapacityL) : undefined;
    const initialOdometerKm = form.initialOdometerKm.trim()
      ? Number(form.initialOdometerKm)
      : undefined;

    setIsSubmitting(true);
    try {
      await onCreate({
        initialOdometerKm,
        licensePlate: form.licensePlate.trim(),
        make: form.make.trim(),
        model: form.model.trim(),
        nickname: form.nickname.trim(),
        tankCapacityL,
        year,
      });
    } catch (createError) {
      setFormError(
        createError instanceof Error ? createError.message : 'שגיאה ביצירת הרכב בגיליון.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4" variant="hero">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-on-surface-variant">שלב ראשון</span>
        <h2 className="text-lg font-semibold text-on-surface">הוספת פרטי הרכב</h2>
        <p className="text-sm text-on-surface-variant">
          הגיליון המחובר עדיין ריק — נמלא את פרטי הרכב כדי להתחיל לתעד תדלוקים.
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={(event) => void handleSubmit(event)}>
        <TextInput
          id="car-setup-make"
          label="יצרן"
          onChange={handleFieldChange('make')}
          value={form.make}
        />
        <TextInput
          id="car-setup-model"
          label="דגם"
          onChange={handleFieldChange('model')}
          value={form.model}
        />
        <TextInput
          id="car-setup-year"
          inputMode="numeric"
          label="שנת ייצור"
          numeric
          onChange={handleFieldChange('year')}
          value={form.year}
        />
        <TextInput
          id="car-setup-license-plate"
          inputMode="numeric"
          label="מספר רישוי"
          numeric
          onChange={handleFieldChange('licensePlate')}
          value={form.licensePlate}
        />
        <TextInput
          id="car-setup-nickname"
          label="כינוי"
          onChange={handleFieldChange('nickname')}
          value={form.nickname}
        />
        <TextInput
          hint="אופציונלי"
          id="car-setup-tank-capacity"
          inputMode="decimal"
          label="נפח מיכל"
          numeric
          onChange={handleFieldChange('tankCapacityL')}
          unit="ל׳"
          value={form.tankCapacityL}
        />
        <TextInput
          hint="אופציונלי"
          id="car-setup-initial-odometer"
          inputMode="numeric"
          label="מד אוץ התחלתי"
          numeric
          onChange={handleFieldChange('initialOdometerKm')}
          unit="ק״מ"
          value={form.initialOdometerKm}
        />

        {formError && <p className="text-sm text-tertiary">{formError}</p>}

        <Button disabled={isSubmitting} fullWidth type="submit">
          {isSubmitting ? 'יוצר רכב…' : 'יצירת הרכב'}
        </Button>
      </form>
    </Card>
  );
};

const CarSummary = ({ car }: { car: Car }) => (
  <p className="text-sm text-on-surface-variant">
    <b className="font-semibold text-on-surface">{car.nickname}</b> · {car.make} {car.model} ·{' '}
    {car.year}
  </p>
);

const EmptyFuelEntries = ({ car }: { car: Car }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <CarSummary car={car} />
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm text-on-surface-variant">
          עדיין אין תדלוקים — הוסיפו את התדלוק הראשון
        </p>
        <Button onClick={() => navigate(ROUTES.add.path)} type="button">
          הוספת תדלוק
        </Button>
      </Card>
    </div>
  );
};

const ReadyDashboard = ({ car, fuelEntries }: { car: Car; fuelEntries: FuelEntry[] }) => {
  const chronological = useMemo(() => [...fuelEntries].sort(byRowAscending), [fuelEntries]);
  const newestFirst = useMemo(() => [...chronological].reverse(), [chronological]);
  const latest = chronological[chronological.length - 1];

  const rollingWindow = chronological.slice(-ROLLING_WINDOW_SIZE);
  const rollingAverage = computeRobustAverage(rollingWindow);

  const efficiencies = chronological
    .map((entry) => entry.efficiencyKmPerLiter)
    .filter((value): value is number => value !== undefined);
  const gaugeRange = efficiencies.length > 0 ? computeGaugeRange(efficiencies) : undefined;

  const kmThisYear = computeKmThisYear(chronological);
  const costPer100Km = computeCostPer100Km(chronological);
  const pricePerLiter =
    latest.pricePerLiter ??
    (latest.totalPrice !== undefined && latest.liters > 0
      ? latest.totalPrice / latest.liters
      : undefined);

  const isGoodEfficiency = (efficiency: number | undefined) =>
    efficiency === undefined || rollingAverage === undefined || efficiency >= rollingAverage * 0.9;

  return (
    <div className="flex flex-col gap-6">
      <CarSummary car={car} />

      <Card variant="hero" className="flex flex-col gap-4">
        <span className="text-xs font-medium text-on-surface-variant">צריכה בתדלוק האחרון</span>
        {latest.efficiencyKmPerLiter !== undefined && gaugeRange ? (
          <>
            <Gauge
              average={rollingAverage}
              max={gaugeRange.max}
              min={gaugeRange.min}
              value={latest.efficiencyKmPerLiter}
            />
            {rollingAverage !== undefined && (
              <div className="flex items-center gap-2 border-t border-ghost pt-2 text-[13px] text-on-surface-variant">
                <span>ממוצע מתגלגל ({rollingWindow.length} תדלוקים):</span>
                <b className="ltr-num font-semibold text-on-surface">
                  {rollingAverage.toFixed(1)} ק״מ/ל
                </b>
                <Chip
                  className="ms-auto"
                  status={isGoodEfficiency(latest.efficiencyKmPerLiter) ? 'optimal' : 'caution'}
                >
                  {isGoodEfficiency(latest.efficiencyKmPerLiter) ? 'תקין' : 'כדאי לבדוק'}
                </Chip>
              </div>
            )}
          </>
        ) : (
          <p className="py-6 text-center text-sm text-on-surface-variant">
            עוד תדלוק אחד ותהיה כאן קריאת צריכה ראשונה.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <StatTile label="עלות תדלוק אחרון" value={formatCurrency(latest.totalPrice)} />
        <StatTile label="מחיר לליטר" value={formatCurrency(pricePerLiter)} />
        <StatTile
          label="סה״כ ק״מ (השנה)"
          unit="ק״מ"
          value={kmThisYear !== undefined ? formatKm(kmThisYear) : '—'}
        />
        <StatTile
          label="עלות ל-100 ק״מ"
          value={costPer100Km !== undefined ? formatCurrency(costPer100Km) : '—'}
        />
      </div>

      <div className="flex flex-col gap-2">
        {newestFirst.map((entry) => (
          <FuelRow
            costLabel={formatCurrency(entry.totalPrice)}
            date={formatEntryDate(entry.date)}
            efficiencyLabel={
              entry.efficiencyKmPerLiter !== undefined
                ? `${entry.efficiencyKmPerLiter.toFixed(1)} ק״מ/ל`
                : 'תדלוק ראשון'
            }
            key={entry.row}
            meta={`${entry.liters.toFixed(1)} ליטר · ${formatKm(entry.odometerKm)} ק״מ`}
            status={isGoodEfficiency(entry.efficiencyKmPerLiter) ? 'good' : 'warn'}
          />
        ))}
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { car, createCar, error, fuelEntries, refresh, status } = useCarData();

  if (status === 'loading' || status === 'idle') return <LoadingState />;
  if (status === 'error')
    return <ErrorState message={error ?? 'שגיאה לא צפויה.'} onRetry={() => void refresh()} />;
  if (status === 'needs-setup') return <CarSetupForm onCreate={createCar} />;
  if (!car) return <LoadingState />;
  if (fuelEntries.length === 0) return <EmptyFuelEntries car={car} />;
  return <ReadyDashboard car={car} fuelEntries={fuelEntries} />;
};
