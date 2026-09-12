import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/routes';
import { AuthStatus, useAuth } from '../../auth';
import { Button, Card, Chip, TextInput } from '../../components';
import { useCarData } from '../../carData';
import type { Car } from '../../models';
import { useSheet } from '../../sheet';
import {
  settingsCarCard,
  settingsCarDetails,
  settingsCarLabel,
  settingsCarList,
  settingsCarRow,
  settingsErrorText,
  settingsFieldGrid,
  settingsInlineHint,
  settingsInlineSuccess,
  settingsLink,
  settingsLocaleValue,
  settingsMetaGrid,
  settingsPage,
  settingsReadonlyCard,
  settingsReadonlyLabel,
  settingsReadonlyValue,
  settingsSectionBody,
  settingsSectionCard,
  settingsSectionEyebrow,
  settingsSectionHeader,
  settingsSectionTitle,
  settingsStatusRow,
} from './settingsStyles';

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

const carToFormState = (car: Car): CarFormState => ({
  initialOdometer: car.initialOdometerKm?.toString() ?? '',
  licensePlate: car.licensePlate,
  make: car.make,
  model: car.model,
  nickname: car.nickname,
  tankCapacity: car.tankCapacityL?.toString() ?? '',
  year: car.year.toString(),
});

const parseOptionalNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : Number(trimmed);
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

const SettingsSection = ({
  children,
  eyebrow,
  title,
  variant = 'default',
}: SettingsSectionProps) => (
  <Card className={settingsSectionCard()} variant={variant}>
    <div className={settingsSectionHeader()}>
      {eyebrow ? <span className={settingsSectionEyebrow()}>{eyebrow}</span> : null}
      <h2 className={settingsSectionTitle()}>{title}</h2>
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
    // Deferred via setTimeout so these setState calls run outside the
    // synchronous effect flush — see eslint-plugin-react-hooks'
    // `set-state-in-effect` rule (same pattern as `CarDataProvider`).
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
      return <p className={settingsSectionBody()}>טוען נתונים…</p>;
    }

    if (carStatus === 'error') {
      return (
        <>
          <p className={settingsErrorText()}>{carError ?? 'שגיאה בטעינת נתוני הרכב.'}</p>
          <Button fullWidth onClick={() => void refresh()} type="button" variant="secondary">
            נסה שוב
          </Button>
        </>
      );
    }

    if (carStatus === 'needs-setup') {
      return (
        <>
          <p className={settingsSectionBody()}>
            עדיין לא הוגדר רכב בגיליון המחובר. יש להגדיר רכב במסך הבית לפני שאפשר לערוך כאן את
            פרטיו.
          </p>
          <Button fullWidth onClick={() => navigate(ROUTES.home.path)} type="button">
            מעבר למסך הבית
          </Button>
        </>
      );
    }

    return (
      <>
        <div className={settingsFieldGrid()}>
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
            inputMode="numeric"
            label="שנת ייצור"
            numeric
            onChange={handleFieldChange('year')}
            value={formState.year}
          />
          <TextInput
            id="settings-license-plate"
            inputMode="numeric"
            label="מספר רישוי"
            numeric
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
            inputMode="decimal"
            label="נפח מיכל"
            numeric
            onChange={handleFieldChange('tankCapacity')}
            unit="ל׳"
            value={formState.tankCapacity}
          />
          <TextInput
            hint="אופציונלי"
            id="settings-initial-odometer"
            inputMode="numeric"
            label="מד אוץ התחלתי"
            numeric
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
        {saveState === 'saved' ? <p className={settingsInlineSuccess()}>נשמר.</p> : null}
        {saveState === 'error' ? (
          <p className={settingsErrorText()}>{saveError ?? 'שגיאה בשמירת פרטי הרכב.'}</p>
        ) : null}
      </>
    );
  };

  return (
    <div className={settingsPage()}>
      <SettingsSection eyebrow="פרטי רכב" title="עריכת פרטי הרכב" variant="hero">
        {renderCarInfoSection()}
      </SettingsSection>

      <SettingsSection eyebrow="טאבים בגיליון" title="מעבר בין רכבים">
        <p className={settingsSectionBody()}>
          כל רכב נשמר בטאב נפרד באותו גיליון. כרגע נתמך רק רכב אחד לגיליון — מעבר בין כמה רכבים
          יתווסף בעדכון עתידי.
        </p>

        {carStatus === 'ready' && car ? (
          <div className={settingsCarList()}>
            <div className={settingsCarRow({ active: true })}>
              <div className={settingsCarCard()}>
                <div>
                  <p className={settingsCarLabel()}>{car.nickname}</p>
                  <p className={settingsCarDetails()}>
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
        <p className={settingsInlineHint()}>
          תמיכה במספר רכבים באותו גיליון עדיין לא זמינה — הכפתור יופעל בעדכון עתידי.
        </p>
      </SettingsSection>

      <SettingsSection eyebrow="חיבור נתונים" title="הגיליון המחובר" variant="elevated">
        {sheet ? (
          <div className={settingsMetaGrid()}>
            <Card className={settingsReadonlyCard()}>
              <span className={settingsReadonlyLabel()}>שם הגיליון</span>
              <p className={settingsReadonlyValue()}>{sheet.name}</p>
            </Card>

            <Card className={settingsReadonlyCard()}>
              <span className={settingsReadonlyLabel()}>קישור</span>
              <a
                className={settingsLink()}
                href={`https://docs.google.com/spreadsheets/d/${sheet.id}/edit`}
                rel="noreferrer"
                target="_blank"
              >
                פתיחת הגיליון ב־Google Sheets
              </a>
            </Card>
          </div>
        ) : (
          <p className={settingsSectionBody()}>לא מחובר גיליון כרגע.</p>
        )}

        <Button fullWidth onClick={handleDisconnectSheet} type="button" variant="secondary">
          החלפת גיליון
        </Button>
        <p className={settingsInlineHint()}>
          ניתוק הגיליון המחובר ומעבר למסך החיבור כדי לבחור או ליצור גיליון אחר.
        </p>
      </SettingsSection>

      <SettingsSection eyebrow="חשבון" title="חיבור ל־Google">
        <div className={settingsStatusRow()}>
          {isSignedIn ? <Chip>מחובר</Chip> : <Chip status="caution">לא מחובר</Chip>}
          <p className={settingsSectionBody()}>
            {isSignedIn
              ? 'החשבון מחובר ויכול לגשת לגיליון שבחרתם.'
              : 'כדי לנהל גיליונות צריך להתחבר מחדש דרך מסך החיבור.'}
          </p>
        </div>

        {isSignedIn ? (
          <Button fullWidth onClick={() => void signOut()} type="button" variant="secondary">
            התנתקות
          </Button>
        ) : null}
      </SettingsSection>

      <SettingsSection eyebrow="לוקליזציה" title="העדפות קבועות ב־v1">
        <Card className={settingsReadonlyCard()}>
          <span className={settingsReadonlyLabel()}>שפה, מטבע ומרחק</span>
          <p className={settingsLocaleValue()}>עברית · ₪ · ק״מ</p>
        </Card>
      </SettingsSection>
    </div>
  );
};
