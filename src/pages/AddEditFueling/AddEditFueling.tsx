import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import { useCarData } from '../../carData';
import { Button, Card, TextInput } from '../../components';
import { formatDateForSheet, parseSheetDate, type FuelEntry } from '../../models';

interface FuelingFormState {
  date: string;
  liters: string;
  notes: string;
  odometerKm: string;
  totalPrice: string;
}

interface FuelingValidation {
  errors: Partial<Record<keyof FuelingFormState, string>>;
  warnings: Partial<Record<'date' | 'duplicate' | 'odometerKm', string>>;
}

interface FuelingFormProps {
  initialOdometerKm: number | undefined;
  isEditMode: boolean;
  siblingEntries: FuelEntry[];
  entry?: FuelEntry;
  previousEntry?: FuelEntry;
  row?: number;
}

const formatTodayLocal = () => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const parseIsoDateLocal = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatEntryDate = (isoDate: string) =>
  new Intl.DateTimeFormat('he', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseIsoDateLocal(isoDate));

const createEmptyFormState = (): FuelingFormState => ({
  date: formatTodayLocal(),
  liters: '',
  notes: '',
  odometerKm: '',
  totalPrice: '',
});

const fuelEntryToFormState = (entry: FuelEntry): FuelingFormState => ({
  date: parseSheetDate(entry.date),
  liters: entry.liters.toString(),
  notes: entry.notes ?? '',
  odometerKm: entry.odometerKm.toString(),
  totalPrice: entry.totalPrice?.toString() ?? '',
});

const parseRequiredNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatKm = (value: number) => new Intl.NumberFormat('en-US').format(Math.round(value));

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

const MissingEntryState = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-base font-semibold text-on-surface">התדלוק לא נמצא</h1>
        <p className="text-sm text-on-surface-variant">
          ייתכן שהקישור ישן, או שהתדלוק כבר נמחק מהגיליון.
        </p>
      </div>
      <Button fullWidth onClick={() => navigate(ROUTES.home.path)} type="button">
        חזרה ללוח הבקרה
      </Button>
    </Card>
  );
};

const ReadinessFallback = ({ description, title }: { description: string; title: string }) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col gap-4" variant="hero">
      <div className="flex flex-col gap-2">
        <h1 className="text-base font-semibold text-on-surface">{title}</h1>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
      <Button fullWidth onClick={() => navigate(ROUTES.home.path)} type="button">
        מעבר למסך הבית
      </Button>
    </Card>
  );
};

const validateFuelingForm = ({
  form,
  isEditMode,
  previousEntry,
  row,
  siblingEntries,
}: {
  form: FuelingFormState;
  isEditMode: boolean;
  previousEntry: FuelEntry | undefined;
  row: number | undefined;
  siblingEntries: FuelEntry[];
}): FuelingValidation => {
  const errors: FuelingValidation['errors'] = {};
  const warnings: FuelingValidation['warnings'] = {};

  const liters = parseRequiredNumber(form.liters);
  if (liters === undefined || liters <= 0) {
    errors.liters = 'יש להזין כמות ליטרים גדולה מ-0.';
  }

  const totalPrice = parseRequiredNumber(form.totalPrice);
  if (totalPrice === undefined || totalPrice <= 0) {
    errors.totalPrice = 'יש להזין סכום לתשלום גדול מ-0.';
  }

  const odometerKm = parseRequiredNumber(form.odometerKm);
  if (odometerKm === undefined) {
    errors.odometerKm = 'יש להזין קריאת מד אוץ.';
  } else if (previousEntry && odometerKm <= previousEntry.odometerKm) {
    warnings.odometerKm = `קריאת מד האוץ נמוכה או זהה לתדלוק הקודם (${formatKm(previousEntry.odometerKm)} ק״מ). בדקו שהמספר נכון לפני השמירה.`;
  }

  if (!form.date) {
    errors.date = 'יש לבחור תאריך.';
  } else if (form.date > formatTodayLocal()) {
    warnings.date = 'התאריך בעתיד. אפשר לשמור אם זו הכנה מוקדמת.';
  }

  if (odometerKm !== undefined && form.date) {
    const duplicateEntry = siblingEntries.find((entry) => {
      if (isEditMode && row === entry.row) return false;
      if (entry.odometerKm !== odometerKm) return false;
      const differenceMs = Math.abs(
        parseIsoDateLocal(entry.date).getTime() - parseIsoDateLocal(form.date).getTime(),
      );
      const differenceDays = differenceMs / (24 * 60 * 60 * 1000);
      return differenceDays <= 2;
    });

    if (duplicateEntry) {
      warnings.duplicate = `נמצא תדלוק דומה ב-${formatEntryDate(duplicateEntry.date)} עם אותה קריאת מד אוץ. כדאי לוודא שלא מדובר בכפילות.`;
    }
  }

  return { errors, warnings };
};

const FuelingForm = (props: FuelingFormProps) => {
  const { entry, initialOdometerKm, isEditMode, previousEntry, row, siblingEntries } = props;
  const navigate = useNavigate();
  const { addFuelEntry, deleteFuelEntry, updateFuelEntry } = useCarData();
  const [form, setForm] = useState<FuelingFormState>(() =>
    entry ? fuelEntryToFormState(entry) : createEmptyFormState(),
  );
  const [action, setAction] = useState<'deleting' | 'idle' | 'saving'>('idle');
  const [isOdometerOverrideConfirmed, setIsOdometerOverrideConfirmed] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [showValidation, setShowValidation] = useState(false);
  const [showOverridePrompt, setShowOverridePrompt] = useState(false);

  const validation = useMemo(
    () =>
      validateFuelingForm({
        form,
        isEditMode,
        previousEntry,
        row,
        siblingEntries,
      }),
    [form, isEditMode, previousEntry, row, siblingEntries],
  );

  const isSubmitting = action !== 'idle';

  const handleFieldChange =
    (field: keyof FuelingFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
      if (field === 'odometerKm') {
        setIsOdometerOverrideConfirmed(false);
        setShowOverridePrompt(false);
      }
      setSaveError(undefined);
    };

  const submitFueling = async () => {
    const liters = parseRequiredNumber(form.liters);
    const odometerKm = parseRequiredNumber(form.odometerKm);
    const totalPrice = parseRequiredNumber(form.totalPrice);
    if (liters === undefined || odometerKm === undefined || totalPrice === undefined) return;

    setAction('saving');
    try {
      const payload = {
        date: formatDateForSheet(form.date),
        liters,
        notes: form.notes.trim() || undefined,
        odometerKm,
        totalPrice,
      };

      if (isEditMode && row !== undefined) {
        await updateFuelEntry(row, payload);
      } else {
        await addFuelEntry(payload);
      }

      navigate(ROUTES.home.path);
    } catch (submitError) {
      setSaveError(
        submitError instanceof Error
          ? submitError.message
          : isEditMode
            ? 'שגיאה בעדכון התדלוק. אפשר לנסות שוב.'
            : 'שגיאה בשמירת התדלוק. אפשר לנסות שוב.',
      );
    } finally {
      setAction('idle');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowValidation(true);
    setSaveError(undefined);

    if (Object.keys(validation.errors).length > 0) return;

    if (validation.warnings.odometerKm && !isOdometerOverrideConfirmed) {
      setShowOverridePrompt(true);
      return;
    }

    await submitFueling();
  };

  const handleOverrideConfirm = async () => {
    setIsOdometerOverrideConfirmed(true);
    setShowOverridePrompt(false);
    await submitFueling();
  };

  const handleDelete = async () => {
    if (row === undefined) return;

    const confirmed = window.confirm(
      `למחוק את התדלוק מתאריך ${formatEntryDate(form.date)}? אי אפשר לשחזר את הפעולה.`,
    );
    if (!confirmed) return;

    setAction('deleting');
    setSaveError(undefined);
    try {
      await deleteFuelEntry(row);
      navigate(ROUTES.home.path);
    } catch (deleteError) {
      setSaveError(
        deleteError instanceof Error ? deleteError.message : 'שגיאה במחיקת התדלוק. אפשר לנסות שוב.',
      );
    } finally {
      setAction('idle');
    }
  };

  const odometerHint = validation.warnings.odometerKm
    ? validation.warnings.odometerKm
    : previousEntry
      ? `התדלוק הקודם: ${formatKm(previousEntry.odometerKm)} ק״מ · ${formatEntryDate(previousEntry.date)}`
      : initialOdometerKm !== undefined
        ? `אין תדלוק קודם. מד האוץ ההתחלתי של הרכב: ${formatKm(initialOdometerKm)} ק״מ`
        : 'אין עדיין תדלוק קודם — זהו כנראה התדלוק הראשון.';

  return (
    <Card className="flex flex-col gap-5" variant="hero">
      <div className="flex flex-col gap-1">
        <h1 className="text-base font-semibold text-on-surface">
          {isEditMode ? 'עריכת תדלוק' : 'הוספת תדלוק'}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {isEditMode
            ? 'עדכנו את הנתונים ושמרו כדי לסנכרן אותם חזרה לגיליון.'
            : 'ממלאים את פרטי התדלוק, ושומרים ישירות לגיליון המשותף.'}
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        <TextInput
          hint={showValidation ? validation.errors.date : undefined}
          id="fueling-date"
          label="תאריך"
          numeric
          onChange={handleFieldChange('date')}
          type="date"
          value={form.date}
          warning={Boolean(showValidation && validation.errors.date)}
        />
        {validation.warnings.date ? (
          <p className="text-xs text-tertiary">{validation.warnings.date}</p>
        ) : null}

        <TextInput
          hint={
            showValidation && validation.errors.odometerKm
              ? validation.errors.odometerKm
              : odometerHint
          }
          id="fueling-odometer"
          label="קריאת מד אוץ"
          numericKind="integer"
          onChange={handleFieldChange('odometerKm')}
          placeholder="41,980"
          unit="ק״מ"
          value={form.odometerKm}
          warning={
            Boolean(showValidation && validation.errors.odometerKm) ||
            Boolean(validation.warnings.odometerKm)
          }
        />

        <TextInput
          hint={showValidation ? validation.errors.liters : undefined}
          id="fueling-liters"
          label="כמות דלק"
          numericKind="decimal"
          onChange={handleFieldChange('liters')}
          placeholder="28.0"
          unit="ליטר"
          value={form.liters}
          warning={Boolean(showValidation && validation.errors.liters)}
        />

        <TextInput
          hint={showValidation ? validation.errors.totalPrice : undefined}
          id="fueling-total-price"
          label="סה״כ לתשלום"
          numericKind="decimal"
          onChange={handleFieldChange('totalPrice')}
          placeholder="158.20"
          unit="₪"
          value={form.totalPrice}
          warning={Boolean(showValidation && validation.errors.totalPrice)}
        />

        <TextInput
          hint="אופציונלי"
          id="fueling-notes"
          label="הערות"
          onChange={handleFieldChange('notes')}
          placeholder="לדוגמה: תחנה בכניסה לעיר"
          value={form.notes}
        />

        {validation.warnings.duplicate ? (
          <p className="text-sm text-tertiary">{validation.warnings.duplicate}</p>
        ) : null}
        {showOverridePrompt && validation.warnings.odometerKm ? (
          <div className="flex flex-col gap-3 rounded-lg border border-tertiary/30 bg-tertiary/10 p-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-tertiary">בדיקת קריאת מד אוץ</p>
              <p className="text-sm text-on-surface">{validation.warnings.odometerKm}</p>
              <p className="text-xs text-on-surface-variant">
                אפשר לחזור לעריכה או לאשר שמירה בכל זאת.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                disabled={isSubmitting}
                fullWidth
                onClick={() => setShowOverridePrompt(false)}
                type="button"
                variant="secondary"
              >
                חזרה לעריכה
              </Button>
              <Button
                disabled={isSubmitting}
                fullWidth
                onClick={() => void handleOverrideConfirm()}
                type="button"
              >
                {action === 'saving' ? 'שומר…' : 'שמירה בכל זאת'}
              </Button>
            </div>
          </div>
        ) : null}
        {saveError ? <p className="text-sm text-tertiary">{saveError}</p> : null}

        <div className="flex flex-col gap-3 pt-2">
          <Button disabled={isSubmitting} fullWidth type="submit">
            {action === 'saving' ? 'שומר…' : isEditMode ? 'שמירת שינויים' : 'שמירת תדלוק'}
          </Button>
          {isEditMode ? (
            <Button
              disabled={isSubmitting}
              fullWidth
              onClick={() => void handleDelete()}
              type="button"
              variant="secondary"
            >
              {action === 'deleting' ? 'מוחק…' : 'מחיקת תדלוק'}
            </Button>
          ) : null}
          <Button
            disabled={isSubmitting}
            fullWidth
            onClick={() => navigate(ROUTES.home.path)}
            type="button"
            variant="secondary"
          >
            ביטול
          </Button>
        </div>
      </form>
    </Card>
  );
};

export const AddEditFuelingPage = () => {
  const { car, error, fuelEntries, refresh, status } = useCarData();
  const [searchParams] = useSearchParams();
  const rowParam = searchParams.get('row');
  const row = rowParam ? Number(rowParam) : undefined;
  const isEditMode = rowParam !== null;

  const chronological = useMemo(
    () => [...fuelEntries].sort((left, right) => left.row - right.row),
    [fuelEntries],
  );
  const entry =
    row === undefined || Number.isNaN(row)
      ? undefined
      : fuelEntries.find((item) => item.row === row);
  const entryIndex =
    row === undefined || Number.isNaN(row) ? -1 : chronological.findIndex((item) => item.row === row);
  const previousEntry =
    isEditMode && entryIndex > 0
      ? chronological[entryIndex - 1]
      : !isEditMode
        ? chronological[chronological.length - 1]
        : undefined;

  if (status === 'idle' || status === 'loading') return <LoadingState />;
  if (status === 'error') {
    return <ErrorState message={error ?? 'שגיאה לא צפויה.'} onRetry={() => void refresh()} />;
  }
  if (status === 'needs-setup') {
    return (
      <ReadinessFallback
        description="לפני שמוסיפים תדלוק צריך להגדיר רכב בגיליון המחובר."
        title="עדיין אין רכב פעיל"
      />
    );
  }
  if (!car) return <LoadingState />;
  if (rowParam !== null && (row === undefined || Number.isNaN(row) || !entry))
    return <MissingEntryState />;

  return (
    <FuelingForm
      entry={entry}
      initialOdometerKm={car.initialOdometerKm}
      isEditMode={isEditMode}
      key={rowParam ?? 'new'}
      previousEntry={previousEntry}
      row={row}
      siblingEntries={fuelEntries}
    />
  );
};
