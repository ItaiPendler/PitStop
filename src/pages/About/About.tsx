import { Card } from '../../components';

export const AboutPage = () => (
  <Card className="flex flex-col gap-3 text-sm leading-6 text-on-surface-variant">
    <p>
      <b className="text-on-surface">PitStop</b> עוקב אחרי תדלוקים וצריכת דלק של הרכב שלך, ישירות
      מתוך גיליון Google Sheets משותף — בלי שרת ובלי מסד נתונים משלו.
    </p>
    <p>
      שתפו את הגיליון עם מי שרוצה לראות או לעדכן את הנתונים, התחברו עם Google, והוסיפו תדלוק ראשון.
    </p>
  </Card>
);
