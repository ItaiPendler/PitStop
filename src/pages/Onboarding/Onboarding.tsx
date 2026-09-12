import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthStatus, useAuth } from '../../auth';
import { Button, Card, Chip, TextInput } from '../../components';
import { useSheet } from '../../sheet';
import { ROUTES } from '../../app/routes';
import {
  onboardingActions,
  onboardingBody,
  onboardingErrorText,
  onboardingEyebrow,
  onboardingHeroCard,
  onboardingLead,
  onboardingPage,
  onboardingSectionCard,
  onboardingTitle,
} from './onboardingStyles';

export const OnboardingPage = () => {
  const { error: authError, signIn, status } = useAuth();
  const { connectExisting, createNew, error, isBusy, sheet } = useSheet();
  const [newSheetTitle, setNewSheetTitle] = useState('הרכב שלי');
  const navigate = useNavigate();

  const isSignedIn = status === AuthStatus.SignedIn;
  const isReconnectFlow = !isSignedIn && Boolean(sheet) && Boolean(authError);
  // A sheet id can be stored (localStorage) even when signed out — per
  // spec.md §15, that alone must never be enough to view data, so we still
  // require a live sign-in before treating onboarding as "done".
  const isFullyConnected = isSignedIn && Boolean(sheet);

  // Once both a live session and a sheet exist, leave onboarding
  // automatically — nothing else was navigating away from this screen
  // otherwise.
  useEffect(() => {
    if (isFullyConnected) navigate(ROUTES.home.path, { replace: true });
  }, [isFullyConnected, navigate]);

  // Avoid flashing the "pick/create a sheet" card for a frame while the
  // redirect effect above is about to fire.
  if (isFullyConnected) return null;

  return (
    <div className={onboardingPage()}>
      <Card className={onboardingHeroCard()} variant="hero">
        <span className={onboardingEyebrow()}>ברוכים הבאים</span>
        <h1 className={onboardingTitle()}>נחבר את הגיליון שלכם</h1>
        <p className={onboardingLead()}>
          כל הנתונים של PitStop נשמרים ונערכים ישירות בגיליון Google שלכם — לא בשרת שלנו. לכן צריך
          חיבור פעיל ל-Google כדי לטעון נתונים, לבחור גיליון ולשמור תדלוקים בזמן אמת.
        </p>
      </Card>

      {!isSignedIn ? (
        <Card className={onboardingSectionCard()}>
          {isReconnectFlow ? (
            <div className="flex flex-col gap-3 rounded-lg border border-tertiary/30 bg-tertiary/10 p-4">
              <Chip className="w-fit" status="caution">
                נדרש חיבור מחדש
              </Chip>
              <p className={onboardingBody()}>
                פג תוקף החיבור הקודם ל-Google, ולכן עצרנו את הגישה לנתוני הגיליון עד לחיבור מחדש.
              </p>
            </div>
          ) : null}
          <p className={onboardingBody()}>
            {sheet
              ? 'הגיליון שלכם כבר נבחר. עכשיו מתחברים מחדש ל-Google כדי להמשיך לעבוד מולו.'
              : 'שלב 1 — מתחברים עם חשבון Google כדי לאפשר ל-PitStop לפתוח ולעדכן את הגיליון שלכם.'}
          </p>
          <Button
            disabled={status === AuthStatus.SigningIn}
            fullWidth
            onClick={() => void signIn()}
            variant="primary"
          >
            {status === AuthStatus.SigningIn
              ? 'מתחבר…'
              : isReconnectFlow
                ? 'חיבור מחדש ל-Google'
                : 'התחברות עם Google'}
          </Button>

          {authError && <p className={onboardingErrorText()}>{authError}</p>}
        </Card>
      ) : (
        <Card className={onboardingSectionCard()}>
          <p className={onboardingBody()}>שלב 2 — בוחרים גיליון קיים או יוצרים חדש.</p>

          <div className={onboardingActions()}>
            <Button disabled={isBusy} fullWidth onClick={() => void connectExisting()}>
              בחירת גיליון קיים
            </Button>

            <TextInput
              disabled={isBusy}
              hint="שם הגיליון שייווצר ב-Google Drive שלכם"
              id="new-sheet-title"
              label="שם לגיליון חדש"
              onChange={(event) => setNewSheetTitle(event.target.value)}
              value={newSheetTitle}
            />
            <Button
              disabled={isBusy || !newSheetTitle.trim()}
              fullWidth
              onClick={() => void createNew(newSheetTitle.trim())}
              variant="secondary"
            >
              {isBusy ? 'יוצר גיליון…' : 'יצירת גיליון חדש'}
            </Button>
          </div>

          {error && <p className={onboardingErrorText()}>{error}</p>}
        </Card>
      )}
    </div>
  );
};
