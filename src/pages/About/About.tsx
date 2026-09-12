import type { ReactNode } from 'react';
import { Card, Chip } from '../../components';
import {
  aboutBody,
  aboutChipRow,
  aboutGrid,
  aboutHeroCard,
  aboutHeroLead,
  aboutHeroTitle,
  aboutInfoCard,
  aboutInfoLabel,
  aboutInfoValue,
  aboutList,
  aboutPage,
  aboutSectionCard,
  aboutSectionEyebrow,
  aboutSectionTitle,
  aboutStepItem,
  aboutStepNumber,
  aboutStepText,
} from './aboutStyles';

interface AboutSectionProps {
  children: ReactNode;
  title: string;
  eyebrow?: string;
  variant?: 'default' | 'elevated';
}

interface StepProps {
  description: string;
  step: string;
}

const AboutSection = ({ children, eyebrow, title, variant = 'default' }: AboutSectionProps) => (
  <Card className={aboutSectionCard()} variant={variant}>
    {eyebrow ? <span className={aboutSectionEyebrow()}>{eyebrow}</span> : null}
    <h2 className={aboutSectionTitle()}>{title}</h2>
    {children}
  </Card>
);

const Step = ({ description, step }: StepProps) => (
  <li className={aboutStepItem()}>
    <span className={aboutStepNumber()}>{step}</span>
    <p className={aboutStepText()}>{description}</p>
  </li>
);

export const AboutPage = () => (
  <div className={aboutPage()}>
    <Card className={aboutHeroCard()} variant="hero">
      <span className={aboutSectionEyebrow()}>אודות PitStop</span>
      <h1 className={aboutHeroTitle()}>מעקב תדלוקים משותף, בלי קבלות נייר ובלי חישובים ידניים</h1>
      <p className={aboutHeroLead()}>
        PitStop היא אפליקציה קטנה למעקב אחר תדלוקים, צריכת דלק והוצאות דלק ברכב משותף. במקום לרשום
        על פתק כמה ליטרים נכנסו ולחשב לבד, שומרים הכול בגיליון Google שלכם ורואים תמונה ברורה
        מהטלפון.
      </p>

      <div className={aboutChipRow()}>
        <Chip>ללא שרת</Chip>
        <Chip>הנתונים בגיליון שלכם</Chip>
        <Chip>מתאים לשני משתמשים ברכב אחד</Chip>
      </div>
    </Card>

    <div className={aboutGrid()}>
      <Card className={aboutInfoCard()}>
        <span className={aboutInfoLabel()}>איפה נשמר המידע</span>
        <p className={aboutInfoValue()}>ב־Google Sheet שאתם בוחרים או יוצרים</p>
      </Card>

      <Card className={aboutInfoCard()}>
        <span className={aboutInfoLabel()}>איך עובדים יחד</span>
        <p className={aboutInfoValue()}>משתפים גיליון אחד, וכל אחד נכנס עם חשבון Google שלו</p>
      </Card>
    </div>

    <AboutSection eyebrow="למה זה קיים" title="להחליף פתקים, קבלות וחישובים ידניים">
      <p className={aboutBody()}>
        הרעיון פשוט: במקום לאסוף קבלות תדלוק, לזכור קילומטראז׳ ולחשב צריכה ידנית, PitStop מרכז את
        הכול במקום אחד שקל לפתוח בכל רגע.
      </p>

      <ul className={aboutList()}>
        <li>לא צריך לשמור קבלות ולנחש מה היה בתדלוק הקודם.</li>
        <li>החישובים נעשים אוטומטית, כולל מחיר לליטר ומדדי צריכה.</li>
        <li>כששני אנשים חולקים רכב, שניהם רואים את אותה היסטוריה.</li>
      </ul>
    </AboutSection>

    <AboutSection eyebrow="איך זה עובד" title="Google נכנסת אתכם, והגיליון שומר את הנתונים">
      <p className={aboutBody()}>
        ל־PitStop אין שרת משלו. אחרי התחברות עם Google, האפליקציה קוראת וכותבת ישירות אל הגיליון
        שבחרתם. אם שיתפתם את אותו גיליון עם בן או בת זוג, הורה, ילד או כל שותף אחר לרכב — כולם
        עובדים על אותם נתונים, בלי סנכרון ידני.
      </p>
    </AboutSection>

    <AboutSection eyebrow="למי זה מתאים" title="רכב אחד, יותר מאדם אחד שנוהג ומתדלק">
      <p className={aboutBody()}>
        PitStop מתאימה במיוחד לכם ולעוד אדם קרוב שחולק אתכם את הרכב: בן או בת זוג, בן משפחה או כל
        שותף קבוע. אם שניכם רוצים להבין כמה הרכב צורך, כמה עולה כל תדלוק ומה קרה בחודשים האחרונים —
        זה בדיוק השימוש.
      </p>
    </AboutSection>

    <AboutSection eyebrow="מדריך קצר" title="איך מתחילים בפועל" variant="elevated">
      <ol className="flex flex-col gap-3">
        <Step description="מתחברים עם חשבון Google האישי שלכם." step="1" />
        <Step description="בוחרים גיליון קיים או יוצרים גיליון חדש למעקב של הרכב." step="2" />
        <Step description="מוסיפים תדלוק: תאריך, קילומטראז׳, ליטרים וסכום." step="3" />
        <Step description="חוזרים לדשבורד ורואים היסטוריה, ממוצעים וסטטיסטיקה." step="4" />
      </ol>
    </AboutSection>
  </div>
);
