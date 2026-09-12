import { Card, Chip, FuelRow, Gauge, StatTile } from '../../components'

export const DashboardPage = () => (
  <div className="flex flex-col gap-6">
    <Card variant="hero" className="flex flex-col gap-4">
      <span className="text-xs font-medium text-on-surface-variant">צריכה בתדלוק האחרון</span>
      <Gauge value={14.2} min={6} max={20} average={13.6} />
      <div className="flex items-center gap-2 border-t border-ghost pt-2 text-[13px] text-on-surface-variant">
        <span>ממוצע מתגלגל (5 תדלוקים):</span>
        <b className="ltr-num font-semibold text-on-surface">13.6 ק״מ/ל</b>
        <Chip status="optimal" className="ms-auto">
          תקין
        </Chip>
      </div>
    </Card>

    <div className="grid grid-cols-2 gap-2">
      <StatTile label="עלות תדלוק אחרון" value="₪158.20" />
      <StatTile label="מחיר לליטר" value="₪5.65" />
      <StatTile label="סה״כ ק״מ (השנה)" value="6,780" unit="ק״מ" />
      <StatTile label="עלות ל-100 ק״מ" value="₪39.80" />
    </div>

    <div className="flex flex-col gap-2">
      <FuelRow
        date="19 ינואר 2026"
        meta="28.0 ליטר · 41,980 ק״מ"
        efficiencyLabel="14.2 ק״מ/ל"
        status="good"
        costLabel="₪158.20"
      />
      <FuelRow
        date="4 ינואר 2026"
        meta="32.1 ליטר · 41,560 ק״מ"
        efficiencyLabel="11.8 ק״מ/ל"
        status="warn"
        costLabel="₪181.20"
      />
    </div>
  </div>
)
