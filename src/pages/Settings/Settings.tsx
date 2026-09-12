import { useState, type ChangeEvent, type ReactNode } from 'react';
import { AuthStatus, useAuth } from '../../auth';
import { Button, Card, Chip, TextInput } from '../../components';
import {
  settingsCarCard,
  settingsCarDetails,
  settingsCarLabel,
  settingsCarList,
  settingsCarRow,
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

interface CarProfile {
  details: string;
  form: CarFormState;
  id: string;
  label: string;
}

interface SettingsSectionProps {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  variant?: 'default' | 'elevated' | 'hero';
}

const MOCK_CARS: CarProfile[] = [
  {
    details: 'Toyota Corolla · 2018',
    form: {
      initialOdometer: '41200',
      licensePlate: '12-345-67',
      make: 'Toyota',
      model: 'Corolla',
      nickname: 'האוטו שלי',
      tankCapacity: '50',
      year: '2018',
    },
    id: 'my-car',
    label: 'האוטו שלי',
  },
  {
    details: 'Skoda Octavia · 2021',
    form: {
      initialOdometer: '',
      licensePlate: '34-567-89',
      make: 'Skoda',
      model: 'Octavia',
      nickname: 'רכב העבודה',
      tankCapacity: '45',
      year: '2021',
    },
    id: 'work-car',
    label: 'רכב העבודה',
  },
  {
    details: 'Mazda 3 · 2016',
    form: {
      initialOdometer: '98650',
      licensePlate: '56-789-01',
      make: 'Mazda',
      model: '3',
      nickname: 'רכב סוף השבוע',
      tankCapacity: '',
      year: '2016',
    },
    id: 'weekend-car',
    label: 'רכב סוף השבוע',
  },
];

const ACTIVE_SHEET = {
  link: 'https://docs.google.com/spreadsheets/d/1PitStopDemoSheet1234567890/edit',
  name: 'PitStop · משפחה',
};

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

const getCarProfile = (carId: string) => MOCK_CARS.find((car) => car.id === carId) ?? MOCK_CARS[0];

export const SettingsPage = () => {
  const { signOut, status } = useAuth();
  const [activeCarId, setActiveCarId] = useState(MOCK_CARS[0].id);
  const [formState, setFormState] = useState<CarFormState>({ ...MOCK_CARS[0].form });
  const [isSaved, setIsSaved] = useState(false);

  const isSignedIn = status === AuthStatus.SignedIn;

  const handleFieldChange =
    (field: keyof CarFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
      setIsSaved(false);
    };

  const handleCarSelect = (carId: string) => {
    const nextCar = getCarProfile(carId);

    setActiveCarId(nextCar.id);
    setFormState({ ...nextCar.form });
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
  };

  return (
    <div className={settingsPage()}>
      <SettingsSection eyebrow="פרטי רכב" title="עריכת פרטי הרכב" variant="hero">
        <p className={settingsSectionBody()}>
          זהו שלד ה־UI למסך ההגדרות. שמירה מלאה אל Google Sheets תחובר בשלב הבא, אבל כבר אפשר לעדכן
          את השדות ולבדוק את הזרימה.
        </p>

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

        <Button disabled={isSaved} fullWidth onClick={handleSave} type="button">
          {isSaved ? 'נשמר מקומית' : 'שמירת שינויים'}
        </Button>
        {isSaved ? (
          <p className={settingsInlineSuccess()}>
            הטיוטה נשמרה מקומית. חיבור הכתיבה לגיליון יתווסף בשלב הבא.
          </p>
        ) : null}
      </SettingsSection>

      <SettingsSection eyebrow="טאבים בגיליון" title="מעבר בין רכבים">
        <p className={settingsSectionBody()}>
          כל רכב נשמר בטאב נפרד באותו גיליון. בחירה כאן מחליפה בין הטאבים ומציגה טיוטת פרטים תואמת.
        </p>

        <div className={settingsCarList()}>
          {MOCK_CARS.map((car) => {
            const isActive = car.id === activeCarId;

            return (
              <button
                aria-pressed={isActive}
                className={settingsCarRow({ active: isActive })}
                key={car.id}
                onClick={() => handleCarSelect(car.id)}
                type="button"
              >
                <div className={settingsCarCard()}>
                  <div>
                    <p className={settingsCarLabel()}>{car.label}</p>
                    <p className={settingsCarDetails()}>{car.details}</p>
                  </div>
                  {isActive ? <Chip>טאב פעיל</Chip> : null}
                </div>
              </button>
            );
          })}
        </div>

        <Button fullWidth type="button" variant="secondary">
          הוספת רכב חדש
        </Button>
        <p className={settingsInlineHint()}>
          כפתור זה ישמש בהמשך ליצירת טאב חדש בגיליון ולפתיחת טופס רכב ריק.
        </p>
      </SettingsSection>

      <SettingsSection eyebrow="חיבור נתונים" title="הגיליון המחובר" variant="elevated">
        <div className={settingsMetaGrid()}>
          <Card className={settingsReadonlyCard()}>
            <span className={settingsReadonlyLabel()}>שם הגיליון</span>
            <p className={settingsReadonlyValue()}>{ACTIVE_SHEET.name}</p>
          </Card>

          <Card className={settingsReadonlyCard()}>
            <span className={settingsReadonlyLabel()}>קישור</span>
            <a className={settingsLink()} href={ACTIVE_SHEET.link} rel="noreferrer" target="_blank">
              פתיחת הגיליון ב־Google Sheets
            </a>
          </Card>
        </div>

        <Button fullWidth type="button" variant="secondary">
          החלפת גיליון
        </Button>
        <p className={settingsInlineHint()}>
          חיבור ל־Google Picker נמצא בפיתוח, ולכן הכפתור נשאר כרגע כשלד ברור למסך.
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
