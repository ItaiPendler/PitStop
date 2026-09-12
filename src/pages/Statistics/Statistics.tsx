import { StatTile } from '../../components';

export const StatisticsPage = () => (
  <div className="flex flex-col gap-6">
    <div className="grid grid-cols-2 gap-2">
      <StatTile label="ממוצע צריכה" value="13.6" unit="ק״מ/ל" />
      <StatTile label="סה״כ מרחק" value="6,780" unit="ק״מ" />
      <StatTile label="סה״כ דלק" value="498" unit="ליטר" />
      <StatTile label="סה״כ עלות" value="₪2,812" />
    </div>

    <p className="text-sm text-on-surface-variant">גרפי מגמה יתווספו בשלב הבא.</p>
  </div>
);
