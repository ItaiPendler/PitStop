import { useState } from 'react';
import { Button, Card, TextInput } from '../../components';
import { useAuth } from '../../auth';
import { useSheet } from '../../sheet';
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
  const { signIn, status } = useAuth();
  const { connectExisting, createNew, error, isBusy } = useSheet();
  const [newSheetTitle, setNewSheetTitle] = useState('הרכב שלי');

  const isSignedIn = status === 'signed-in';

  return (
    <div className={onboardingPage()}>
      <Card className={onboardingHeroCard()} variant="hero">
        <span className={onboardingEyebrow()}>ברוכים הבאים</span>
        <h1 className={onboardingTitle()}>נחבר את הגיליון שלכם</h1>
        <p className={onboardingLead()}>
          כל הנתונים של PitStop נשמרים בגיליון Google שלכם — לא בשרת שלנו. מתחברים עם Google, ואז
          בוחרים או יוצרים את הגיליון שישמש למעקב.
        </p>
      </Card>

      {!isSignedIn ? (
        <Card className={onboardingSectionCard()}>
          <p className={onboardingBody()}>שלב 1 — מתחברים עם חשבון Google.</p>
          <Button
            disabled={status === 'signing-in'}
            fullWidth
            onClick={() => void signIn()}
            variant="primary"
          >
            {status === 'signing-in' ? 'מתחבר…' : 'התחברות עם Google'}
          </Button>
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
