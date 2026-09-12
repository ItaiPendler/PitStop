import type { ReactNode } from 'react';
import {
  BodyText,
  Card,
  Chip,
  Eyebrow,
  FieldLabel,
  FieldValue,
  PageTitle,
  SectionBody,
  SectionTitle,
} from '../../components';

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
  <Card className="flex flex-col gap-4" variant={variant}>
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    <SectionTitle>{title}</SectionTitle>
    {children}
  </Card>
);

const Step = ({ description, step }: StepProps) => (
  <li className="flex items-start gap-3 rounded-lg border border-ghost bg-black/10 p-3">
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-on-primary">
      {step}
    </span>
    <BodyText className="pt-0.5">{description}</BodyText>
  </li>
);

export const AboutPage = () => (
  <div className="flex flex-col gap-6">
    <Card className="flex flex-col gap-4" variant="hero">
      <Eyebrow>אודות PitStop</Eyebrow>
      <PageTitle>מעקב תדלוקים משותף, בלי קבלות נייר ובלי חישובים ידניים</PageTitle>
      <BodyText>
        PitStop היא אפליקציה קטנה למעקב אחר תדלוקים, צריכת דלק והוצאות דלק ברכב משותף. במקום לרשום
        על פתק כמה ליטרים נכנסו ולחשב לבד, שומרים הכול בגיליון Google שלכם ורואים תמונה ברורה
        מהטלפון.
      </BodyText>

      <div className="flex flex-wrap gap-2">
        <Chip>ללא שרת</Chip>
        <Chip>הנתונים בגיליון שלכם</Chip>
        <Chip>מתאים לשני משתמשים ברכב אחד</Chip>
      </div>
    </Card>

    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="flex flex-col gap-2 p-4">
        <FieldLabel>איפה נשמר המידע</FieldLabel>
        <FieldValue>ב־Google Sheet שאתם בוחרים או יוצרים</FieldValue>
      </Card>

      <Card className="flex flex-col gap-2 p-4">
        <FieldLabel>איך עובדים יחד</FieldLabel>
        <FieldValue>משתפים גיליון אחד, וכל אחד נכנס עם חשבון Google שלו</FieldValue>
      </Card>
    </div>

    <AboutSection eyebrow="למה זה קיים" title="להחליף פתקים, קבלות וחישובים ידניים">
      <SectionBody>
        הרעיון פשוט: במקום לאסוף קבלות תדלוק, לזכור קילומטראז׳ ולחשב צריכה ידנית, PitStop מרכז את
        הכול במקום אחד שקל לפתוח בכל רגע.
      </SectionBody>

      <ul className="flex flex-col gap-2 text-sm leading-6 text-on-surface-variant marker:text-primary">
        <li>לא צריך לשמור קבלות ולנחש מה היה בתדלוק הקודם.</li>
        <li>החישובים נעשים אוטומטית, כולל מחיר לליטר ומדדי צריכה.</li>
        <li>כששני אנשים חולקים רכב, שניהם רואים את אותה היסטוריה.</li>
      </ul>
    </AboutSection>

    <AboutSection eyebrow="איך זה עובד" title="Google נכנסת אתכם, והגיליון שומר את הנתונים">
      <SectionBody>
        ל־PitStop אין שרת משלו. אחרי התחברות עם Google, האפליקציה קוראת וכותבת ישירות אל הגיליון
        שבחרתם. אם שיתפתם את אותו גיליון עם בן או בת זוג, הורה, ילד או כל שותף אחר לרכב — כולם
        עובדים על אותם נתונים, בלי סנכרון ידני.
      </SectionBody>
    </AboutSection>

    <AboutSection eyebrow="למי זה מתאים" title="רכב אחד, יותר מאדם אחד שנוהג ומתדלק">
      <SectionBody>
        PitStop מתאימה במיוחד לכם ולעוד אדם קרוב שחולק אתכם את הרכב: בן או בת זוג, בן משפחה או כל
        שותף קבוע. אם שניכם רוצים להבין כמה הרכב צורך, כמה עולה כל תדלוק ומה קרה בחודשים האחרונים —
        זה בדיוק השימוש.
      </SectionBody>
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
