import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthStatus, useAuth } from '../../auth';
import {
  BodyText,
  Button,
  Card,
  Chip,
  Eyebrow,
  PageTitle,
  SectionBody,
  TextInput,
} from '../../components';
import { useSheet } from '../../sheet';
import { ROUTES } from '../../app/routes';

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
    <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col justify-center gap-6 p-4">
      <Card className="flex flex-col gap-4" variant="hero">
        <Eyebrow>ברוכים הבאים</Eyebrow>
        <PageTitle>נחבר את הגיליון שלכם</PageTitle>
        <BodyText>
          כל הנתונים של PitStop נשמרים ונערכים ישירות בגיליון Google שלכם — לא בשרת שלנו. לכן צריך
          חיבור פעיל ל-Google כדי לטעון נתונים, לבחור גיליון ולשמור תדלוקים בזמן אמת.
        </BodyText>
      </Card>

      {!isSignedIn ? (
        <Card className="flex flex-col gap-4">
          {isReconnectFlow ? (
            <div className="flex flex-col gap-3 rounded-lg border border-tertiary/30 bg-tertiary/10 p-4">
              <Chip className="w-fit" status="caution">
                נדרש חיבור מחדש
              </Chip>
              <SectionBody>
                פג תוקף החיבור הקודם ל-Google, ולכן עצרנו את הגישה לנתוני הגיליון עד לחיבור מחדש.
              </SectionBody>
            </div>
          ) : null}
          <SectionBody>
            {sheet
              ? 'הגיליון שלכם כבר נבחר. עכשיו מתחברים מחדש ל-Google כדי להמשיך לעבוד מולו.'
              : 'שלב 1 — מתחברים עם חשבון Google כדי לאפשר ל-PitStop לפתוח ולעדכן את הגיליון שלכם.'}
          </SectionBody>
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

          {authError && <p className="text-sm text-tertiary">{authError}</p>}
        </Card>
      ) : (
        <Card className="flex flex-col gap-4">
          <SectionBody>שלב 2 — בוחרים גיליון קיים או יוצרים חדש.</SectionBody>

          <div className="flex flex-col gap-3">
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

          {error && <p className="text-sm text-tertiary">{error}</p>}
        </Card>
      )}
    </div>
  );
};
