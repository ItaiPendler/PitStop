import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import { AuthStatus, useAuth } from '../../auth';
import {
  Button,
  Card,
  Chip,
  Eyebrow,
  FieldLabel,
  FieldValue,
  SectionBody,
  SectionTitle,
  TextInput,
} from '../../components';
import { useCarData } from '../../carData';
import type { Car } from '../../models';
import { useSheet } from '../../sheet';

interface CarFormState {
  initialOdometer: string;
  licensePlate: string;
  make: string;
  model: string;
  nickname: string;
  tankCapacity: string;
  year: string;
}

interface SettingsSectionProps {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  variant?: 'default' | 'elevated' | 'hero';
}

const EMPTY_FORM: CarFormState = {
  initialOdometer: '',
  licensePlate: '',
  make: '',
  model: '',
  nickname: '',
  tankCapacity: '',
  year: '',
};

const settingsCarRow = cva(
  'w-full rounded-lg border bg-surface-container-low p-4 text-right transition-colors focus:outline-none focus-visible:border-primary focus-visible:shadow-glow-amber',
  {
    defaultVariants: {
      active: false,
    },
    variants: {
      active: {
        false: 'border-ghost hover:border-ghost-strong',
        true: 'border-primary/70 bg-surface-container-high shadow-elevated',
      },
    },
  },
);

const carToFormState = (car: Car): CarFormState => ({
  initialOdometer: car.initialOdometerKm?.toString() ?? '',
  licensePlate: car.licensePlate,
  make: car.make,
  model: car.model,
  nickname: car.nickname,
  tankCapacity: car.tankCapacityL?.toString() ?? '',
  year: car.year.toString(),
});

const CURRENT_YEAR = new Date().getFullYear();
const MIN_CAR_YEAR = 1980;

const parseOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const formStateToFields = (form: CarFormState): Omit<Car, 'id'> => ({
  initialOdometerKm: parseOptionalNumber(form.initialOdometer),
  licensePlate: form.licensePlate,
  make: form.make,
  model: form.model,
  nickname: form.nickname,
  tankCapacityL: parseOptionalNumber(form.tankCapacity),
  year: Number(form.year),
});

const validateCarForm = (form: CarFormState): string | undefined => {
  const year = Number(form.year);
  const hasRequiredFields =
    form.make.trim() &&
    form.model.trim() &&
    form.licensePlate.trim() &&
    form.nickname.trim() &&
    form.year.trim() &&
    !Number.isNaN(year);
  if (!hasRequiredFields) return 'יש למלא יצרן, דגם, שנה, מספר רישוי וכינוי.';
  if (year < MIN_CAR_YEAR || year > CURRENT_YEAR + 1) {
    return `שנת ייצור צריכה להיות בין ${MIN_CAR_YEAR.toString()} ל-${(CURRENT_YEAR + 1).toString()}.`;
  }
  return undefined;
};

const SettingsSection = ({
  children,
  eyebrow,
  title,
  variant = 'default',
}: SettingsSectionProps) => (
  <Card className="flex flex-col gap-4" variant={variant}>
    <div className="flex flex-col gap-2">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <SectionTitle>{title}</SectionTitle>
    </div>
    {children}
  </Card>
);

export const SettingsPage = () => {
  const { signOut, status } = useAuth();
  const { car, error: carError, refresh, status: carStatus, updateCar } = useCarData();
  const { disconnect, sheet } = useSheet();
  const navigate = useNavigate();
  const [formState, setFormState] = useState<CarFormState>(EMPTY_FORM);
  const [saveState, setSaveState] = useState<'error' | 'idle' | 'saved' | 'saving'>('idle');
  const [saveError, setSaveError] = useState<string>();

  const isSignedIn = status === AuthStatus.SignedIn;

  useEffect(() => {
    // setTimeout keeps these state updates out of the effect flush.
    const timeoutId = window.setTimeout(() => {
      setFormState(car ? carToFormState(car) : EMPTY_FORM);
      setSaveState('idle');
      setSaveError(undefined);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [car]);

  const handleFieldChange =
    (field: keyof CarFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
      setSaveState('idle');
    };

  const handleSave = async () => {
    const validationError = validateCarForm(formState);
    if (validationError) {
      setSaveError(validationError);
      setSaveState('error');
      return;
    }

    setSaveState('saving');
    setSaveError(undefined);
    try {
      await updateCar(formStateToFields(formState));
      setSaveState('saved');
    } catch (saveErr) {
      setSaveError(saveErr instanceof Error ? saveErr.message : 'שגיאה בשמירת פרטי הרכב.');
      setSaveState('error');
    }
  };

  const handleDisconnectSheet = () => {
    disconnect();
    navigate(ROUTES.onboarding.path);
  };

  const renderCarInfoSection = () => {
    if (carStatus === 'idle' || carStatus === 'loading') {
      return <SectionBody>טוען נתונים…</SectionBody>;
    }

    if (carStatus === 'error') {
      return (
        <>
          <p className="text-sm leading-6 text-tertiary">
            {carError ?? 'שגיאה בטעינת נתוני הרכב.'}
          </p>
          <Button fullWidth onClick={() => void refresh()} type="button" variant="secondary">
            נסה שוב
          </Button>
        </>
      );
    }

    if (carStatus === 'needs-setup') {
      return (
        <>
          <SectionBody>
            עדיין לא הוגדר רכב בגיליון המחובר. יש להגדיר רכב במסך הבית לפני שאפשר לערוך כאן את
            פרטיו.
          </SectionBody>
          <Button fullWidth onClick={() => navigate(ROUTES.home.path)} type="button">
            מעבר למסך הבית
          </Button>
        </>
      );
    }

    return (
      <>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            id="settings-make"
            label="יצרן"
            onChange={handleFieldChange('make')}
            value={formState.make}
          />
          <TextInput
            id="settings-model"
            label="דגם"
            onChange={handleFieldChange('model')}
            value={formState.model}
          />
          <TextInput
            id="settings-year"
            label="שנת ייצור"
            numericKind="integer"
            onChange={handleFieldChange('year')}
            value={formState.year}
          />
          <TextInput
            id="settings-license-plate"
            label="מספר רישוי"
            numericKind="plate"
            onChange={handleFieldChange('licensePlate')}
            value={formState.licensePlate}
          />
          <TextInput
            id="settings-nickname"
            label="כינוי"
            onChange={handleFieldChange('nickname')}
            value={formState.nickname}
          />
          <TextInput
            hint="אופציונלי"
            id="settings-tank-capacity"
            label="נפח מיכל"
            numericKind="decimal"
            onChange={handleFieldChange('tankCapacity')}
            unit="ל׳"
            value={formState.tankCapacity}
          />
          <TextInput
            hint="אופציונלי"
            id="settings-initial-odometer"
            label="מד אוץ התחלתי"
            numericKind="integer"
            onChange={handleFieldChange('initialOdometer')}
            unit="ק״מ"
            value={formState.initialOdometer}
          />
        </div>

        <Button
          disabled={saveState === 'saving'}
          fullWidth
          onClick={() => void handleSave()}
          type="button"
        >
          {saveState === 'saving' ? 'שומר…' : 'שמירת שינויים'}
        </Button>
        {saveState === 'saved' ? <p className="text-sm leading-6 text-secondary">נשמר.</p> : null}
        {saveState === 'error' ? (
          <p className="text-sm leading-6 text-tertiary">
            {saveError ?? 'שגיאה בשמירת פרטי הרכב.'}
          </p>
        ) : null}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection eyebrow="פרטי רכב" title="עריכת פרטי הרכב" variant="hero">
        {renderCarInfoSection()}
      </SettingsSection>

      <SettingsSection eyebrow="טאבים בגיליון" title="מעבר בין רכבים">
        <SectionBody>
          כל רכב נשמר בטאב נפרד באותו גיליון. כרגע נתמך רק רכב אחד לגיליון — מעבר בין כמה רכבים
          יתווסף בעדכון עתידי.
        </SectionBody>

        {carStatus === 'ready' && car ? (
          <div className="flex flex-col gap-3">
            <div className={settingsCarRow({ active: true })}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{car.nickname}</p>
                  <p className="text-xs leading-5 text-on-surface-variant">
                    {car.make} {car.model} · {car.year}
                  </p>
                </div>
                <Chip>טאב פעיל</Chip>
              </div>
            </div>
          </div>
        ) : null}

        <Button disabled fullWidth type="button" variant="secondary">
          הוספת רכב חדש (בקרוב)
        </Button>
        <p className="text-xs leading-5 text-on-surface-variant">
          תמיכה במספר רכבים באותו גיליון עדיין לא זמינה — הכפתור יופעל בעדכון עתידי.
        </p>
      </SettingsSection>

      <SettingsSection eyebrow="חיבור נתונים" title="הגיליון המחובר" variant="elevated">
        {sheet ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="flex flex-col gap-2 p-4">
              <FieldLabel>שם הגיליון</FieldLabel>
              <FieldValue>{sheet.name}</FieldValue>
            </Card>

            <Card className="flex flex-col gap-2 p-4">
              <FieldLabel>קישור</FieldLabel>
              <a
                className="text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary/80"
                href={`https://docs.google.com/spreadsheets/d/${sheet.id}/edit`}
                rel="noreferrer"
                target="_blank"
              >
                פתיחת הגיליון ב־Google Sheets
              </a>
            </Card>
          </div>
        ) : (
          <SectionBody>לא מחובר גיליון כרגע.</SectionBody>
        )}

        <Button fullWidth onClick={handleDisconnectSheet} type="button" variant="secondary">
          החלפת גיליון
        </Button>
        <p className="text-xs leading-5 text-on-surface-variant">
          ניתוק הגיליון המחובר ומעבר למסך החיבור כדי לבחור או ליצור גיליון אחר.
        </p>
      </SettingsSection>

      <SettingsSection eyebrow="חשבון" title="חיבור ל־Google">
        <div className="flex items-start justify-between gap-3 rounded-lg border border-ghost bg-black/10 p-4">
          {isSignedIn ? <Chip>מחובר</Chip> : <Chip status="caution">לא מחובר</Chip>}
          <SectionBody>
            {isSignedIn
              ? 'החשבון מחובר ויכול לגשת לגיליון שבחרתם.'
              : 'כדי לנהל גיליונות צריך להתחבר מחדש דרך מסך החיבור.'}
          </SectionBody>
        </div>

        {isSignedIn ? (
          <Button fullWidth onClick={() => void signOut()} type="button" variant="secondary">
            התנתקות
          </Button>
        ) : null}
      </SettingsSection>

      <SettingsSection eyebrow="לוקליזציה" title="העדפות קבועות ב־v1">
        <Card className="flex flex-col gap-2 p-4">
          <FieldLabel>שפה, מטבע ומרחק</FieldLabel>
          <p className="font-mono text-sm text-on-surface">עברית · ₪ · ק״מ</p>
        </Card>
      </SettingsSection>
    </div>
  );
};
