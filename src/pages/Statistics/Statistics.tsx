import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { useMemo, useState, type ReactNode } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Chip, SegmentedControl, StatTile } from '../../components';
import { ROUTES } from '../../app/routes';
import { useCarData } from '../../carData';
import type { Car, FuelEntry } from '../../models';

ChartJS.register(
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

const AMBER = '#f59e0b';
const AMBER_SOFT = 'rgba(245, 158, 11, 0.2)';
const BORDER = 'rgba(241, 245, 249, 0.14)';
const CURRENT_YEAR = new Date().getFullYear();
const EMERALD = '#4edea3';
const EMERALD_SOFT = 'rgba(78, 222, 163, 0.2)';
const GRID = 'rgba(241, 245, 249, 0.08)';
const MUTED_TEXT = '#d8c3ad';
const ORANGE = '#ff956b';
const ORANGE_SOFT = 'rgba(255, 149, 107, 0.2)';
const ROLLING_WINDOW_SIZE = 5;
const SURFACE = '#171f33';
const TEXT = '#dae2fd';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat('he', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const dayMonthFormatter = new Intl.DateTimeFormat('he', {
  day: '2-digit',
  month: '2-digit',
});
const monthFormatter = new Intl.DateTimeFormat('he', {
  month: 'short',
  year: '2-digit',
});
const oneDecimalFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const twoDecimalFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});
const wholeNumberFormatter = new Intl.NumberFormat('en-US');

type RangeFilter = 'all' | 'last-5' | 'year';

type EfficiencyEntry = FuelEntry & { efficiencyKmPerLiter: number };
type PricePoint = FuelEntry & { derivedPricePerLiter: number };

interface ChartCardProps {
  emptyMessage: string;
  title: string;
  children?: ReactNode;
  description?: string;
}

interface EmptyStateProps {
  car: Car;
  message: string;
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

interface MetricCardValueProps {
  primary: string;
  secondary?: string;
}

const byRowAscending = (a: FuelEntry, b: FuelEntry) => a.row - b.row;

const parseIsoDateLocal = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatCurrency = (value: number | undefined) =>
  value === undefined ? '—' : `₪${currencyFormatter.format(value)}`;

const formatDecimal = (value: number | undefined, digits: 1 | 2 = 1) => {
  if (value === undefined) return '—';
  return digits === 1 ? oneDecimalFormatter.format(value) : twoDecimalFormatter.format(value);
};

const formatEfficiencyValue = (value: number | undefined) =>
  value === undefined ? 'לא זמין' : `${formatDecimal(value)} ק״מ/ל`;

const formatEntryDate = (isoDate: string) => dateFormatter.format(parseIsoDateLocal(isoDate));

const formatKm = (value: number | undefined) =>
  value === undefined ? '—' : wholeNumberFormatter.format(Math.round(value));

const formatLiters = (value: number | undefined) =>
  value === undefined ? '—' : oneDecimalFormatter.format(value);

const formatChartDate = (isoDate: string) => dayMonthFormatter.format(parseIsoDateLocal(isoDate));

const formatMonthKey = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  return monthFormatter.format(new Date(year, month - 1, 1));
};

const getPricePerLiter = (entry: FuelEntry) =>
  entry.pricePerLiter ??
  (entry.totalPrice !== undefined && entry.liters > 0
    ? entry.totalPrice / entry.liters
    : undefined);

const hasEfficiency = (entry: FuelEntry): entry is EfficiencyEntry =>
  entry.efficiencyKmPerLiter !== undefined;

const computeRobustAverage = (window: FuelEntry[]): number | undefined => {
  if (window.length < 2) return undefined;
  const first = window[0];
  const last = window[window.length - 1];
  const litersAfterFirst = window.slice(1).reduce((sum, entry) => sum + entry.liters, 0);
  if (litersAfterFirst <= 0) return undefined;
  return (last.odometerKm - first.odometerKm) / litersAfterFirst;
};

const computeTotalDistance = (window: FuelEntry[]) => {
  if (window.length < 2) return 0;
  return Math.max(0, window[window.length - 1].odometerKm - window[0].odometerKm);
};

const computeCostCoverage = (window: FuelEntry[]) => {
  let intervalCount = 0;
  let kmSum = 0;
  let pricedIntervalCount = 0;
  let totalCost = 0;

  for (let index = 1; index < window.length; index += 1) {
    const current = window[index];
    const previous = window[index - 1];
    const deltaKm = current.odometerKm - previous.odometerKm;
    if (deltaKm <= 0) continue;

    intervalCount += 1;
    kmSum += deltaKm;

    if (current.totalPrice === undefined) continue;
    pricedIntervalCount += 1;
    totalCost += current.totalPrice;
  }

  return { intervalCount, kmSum, pricedIntervalCount, totalCost };
};

const computeAverageDaysBetweenFills = (window: FuelEntry[]) => {
  if (window.length < 2) return undefined;
  let gapCount = 0;
  let totalDays = 0;

  for (let index = 1; index < window.length; index += 1) {
    const current = parseIsoDateLocal(window[index].date).getTime();
    const previous = parseIsoDateLocal(window[index - 1].date).getTime();
    const deltaDays = (current - previous) / (1000 * 60 * 60 * 24);
    if (deltaDays <= 0) continue;
    gapCount += 1;
    totalDays += deltaDays;
  }

  return gapCount > 0 ? totalDays / gapCount : undefined;
};

const computeAverageKmBetweenFills = (window: FuelEntry[]) => {
  if (window.length < 2) return undefined;
  let gapCount = 0;
  let totalKm = 0;

  for (let index = 1; index < window.length; index += 1) {
    const deltaKm = window[index].odometerKm - window[index - 1].odometerKm;
    if (deltaKm <= 0) continue;
    gapCount += 1;
    totalKm += deltaKm;
  }

  return gapCount > 0 ? totalKm / gapCount : undefined;
};

const buildChartContainerClassName = (hasData: boolean) =>
  hasData ? 'h-72 w-full' : 'flex min-h-72 items-center justify-center';

const createCommonOptions = (formattedTick: (value: number) => string, legendDisplay: boolean) =>
  ({
    interaction: {
      intersect: false,
      mode: 'index',
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: legendDisplay,
        labels: {
          boxHeight: 10,
          boxWidth: 10,
          color: TEXT,
          font: {
            family: 'Rubik',
            size: 12,
          },
          usePointStyle: true,
        },
        rtl: true,
        textDirection: 'rtl',
      },
      tooltip: {
        backgroundColor: SURFACE,
        bodyColor: TEXT,
        borderColor: BORDER,
        borderWidth: 1,
        padding: 12,
        rtl: true,
        textDirection: 'rtl',
        titleColor: TEXT,
        titleFont: {
          family: 'Rubik',
          size: 12,
          weight: 600,
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: MUTED_TEXT,
          font: {
            family: 'Rubik',
            size: 11,
          },
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: GRID,
        },
        ticks: {
          callback: (value: string | number) =>
            typeof value === 'number' ? formattedTick(value) : value,
          color: MUTED_TEXT,
          font: {
            family: 'JetBrains Mono',
            size: 11,
          },
        },
      },
    },
  }) as const;

const createLineChartOptions = (formattedTick: (value: number) => string) => {
  const commonOptions = createCommonOptions(formattedTick, true);

  return {
    ...commonOptions,
    elements: {
      line: {
        tension: 0.32,
      },
      point: {
        hitRadius: 12,
        hoverRadius: 5,
        radius: 4,
      },
    },
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        beginAtZero: false,
      },
    },
  } satisfies ChartOptions<'line'>;
};

const createBarChartOptions = (formattedTick: (value: number) => string) =>
  ({
    ...createCommonOptions(formattedTick, false),
  }) satisfies ChartOptions<'bar'>;

const MetricCardValue = ({ primary, secondary }: MetricCardValueProps) => (
  <span className="inline-flex flex-col gap-1">
    <span>{primary}</span>
    {secondary && <span className="text-xs font-normal text-on-surface-variant">{secondary}</span>}
  </span>
);

const LoadingState = () => (
  <div className="flex flex-1 items-center justify-center py-16">
    <p className="text-sm text-on-surface-variant">טוען סטטיסטיקה…</p>
  </div>
);

const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <Card className="flex flex-col gap-4">
    <p className="text-sm text-on-surface">{message}</p>
    <Button onClick={onRetry} type="button">
      נסה שוב
    </Button>
  </Card>
);

const CarSummary = ({ car }: { car: Car }) => (
  <p className="text-sm text-on-surface-variant">
    <b className="font-semibold text-on-surface">{car.nickname}</b> · {car.make} {car.model} ·{' '}
    {car.year}
  </p>
);

const EmptyState = ({ car, message }: EmptyStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <CarSummary car={car} />
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="max-w-sm text-sm text-on-surface-variant">{message}</p>
        <Button onClick={() => navigate(ROUTES.add.path)} type="button">
          הוספת תדלוק
        </Button>
      </Card>
    </div>
  );
};

const NeedsSetupState = () => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-on-surface">אין עדיין רכב מחובר</h2>
      <p className="text-sm text-on-surface-variant">
        כדי לראות סטטיסטיקה צריך קודם להגדיר רכב ולהוסיף תדלוקים בדשבורד.
      </p>
      <Button onClick={() => navigate(ROUTES.home.path)} type="button">
        מעבר לדשבורד
      </Button>
    </Card>
  );
};

const ChartCard = ({ children, description, emptyMessage, title }: ChartCardProps) => (
  <Card className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="text-base font-semibold text-on-surface">{title}</h2>
      {description && <p className="text-sm text-on-surface-variant">{description}</p>}
    </div>

    <div className={buildChartContainerClassName(Boolean(children))}>
      {children ?? <p className="text-center text-sm text-on-surface-variant">{emptyMessage}</p>}
    </div>
  </Card>
);

const ReadyStatistics = ({ car, fuelEntries }: { car: Car; fuelEntries: FuelEntry[] }) => {
  const [range, setRange] = useState<RangeFilter>('all');

  const chronological = useMemo(() => [...fuelEntries].sort(byRowAscending), [fuelEntries]);

  const filteredEntries = useMemo(() => {
    if (range === 'year') {
      return chronological.filter(
        (entry) => parseIsoDateLocal(entry.date).getFullYear() === CURRENT_YEAR,
      );
    }

    if (range === 'last-5') {
      return chronological.slice(-ROLLING_WINDOW_SIZE);
    }

    return chronological;
  }, [chronological, range]);

  const rangeLabel =
    range === 'all' ? 'כל התקופה' : range === 'year' ? 'השנה' : `${ROLLING_WINDOW_SIZE} אחרונים`;
  const needsAnotherFuelingForEfficiency = filteredEntries.length === 1;

  const summary = useMemo(() => {
    const averageEfficiency = computeRobustAverage(filteredEntries);
    const averageDaysBetweenFills = computeAverageDaysBetweenFills(filteredEntries);
    const averageKmBetweenFills = computeAverageKmBetweenFills(filteredEntries);
    const bestFill = filteredEntries
      .filter(hasEfficiency)
      .reduce<EfficiencyEntry | undefined>(
        (best, entry) =>
          !best || entry.efficiencyKmPerLiter > best.efficiencyKmPerLiter ? entry : best,
        undefined,
      );
    const costCoverage = computeCostCoverage(filteredEntries);
    const fillCount = filteredEntries.length;
    const latestEntry = fillCount > 0 ? filteredEntries[fillCount - 1] : undefined;
    const latestPricePerLiter = latestEntry ? getPricePerLiter(latestEntry) : undefined;
    const pricePoints = filteredEntries.reduce<PricePoint[]>((points, entry) => {
      const derivedPricePerLiter = getPricePerLiter(entry);
      if (derivedPricePerLiter === undefined) return points;
      return [...points, { ...entry, derivedPricePerLiter }];
    }, []);
    const averagePricePerLiter =
      pricePoints.length > 0
        ? pricePoints.reduce((sum, entry) => sum + entry.derivedPricePerLiter, 0) /
          pricePoints.length
        : undefined;
    const rollingWindow = filteredEntries.slice(-ROLLING_WINDOW_SIZE);
    const rollingAverageEfficiency = computeRobustAverage(rollingWindow);
    const totalDistance = computeTotalDistance(filteredEntries);
    const totalLiters = filteredEntries.reduce((sum, entry) => sum + entry.liters, 0);
    const totalPricedSpend = filteredEntries.reduce(
      (sum, entry) => sum + (entry.totalPrice ?? 0),
      0,
    );
    const totalSpendCoverage = filteredEntries.filter(
      (entry) => entry.totalPrice !== undefined,
    ).length;
    const worstFill = filteredEntries
      .filter(hasEfficiency)
      .reduce<EfficiencyEntry | undefined>(
        (worst, entry) =>
          !worst || entry.efficiencyKmPerLiter < worst.efficiencyKmPerLiter ? entry : worst,
        undefined,
      );

    return {
      averageDaysBetweenFills,
      averageEfficiency,
      averageKmBetweenFills,
      bestFill,
      costPer100Km:
        costCoverage.kmSum > 0 ? (costCoverage.totalCost / costCoverage.kmSum) * 100 : undefined,
      costPerKm: costCoverage.kmSum > 0 ? costCoverage.totalCost / costCoverage.kmSum : undefined,
      fillCount,
      latestPricePerLiter,
      pricedIntervalCount: costCoverage.pricedIntervalCount,
      pricePointCount: pricePoints.length,
      rollingAverageEfficiency,
      totalDistance,
      totalLiters,
      totalPricedSpend,
      totalSpendCoverage,
      totalSpendMissingCount: fillCount - totalSpendCoverage,
      trendDelta:
        latestPricePerLiter !== undefined && averagePricePerLiter !== undefined
          ? latestPricePerLiter - averagePricePerLiter
          : undefined,
      trendReferencePrice: averagePricePerLiter,
      worstFill,
    };
  }, [filteredEntries]);

  const efficiencyChart = useMemo(() => {
    const entries = filteredEntries.filter(hasEfficiency);
    if (entries.length === 0) return undefined;

    const averageEfficiency = summary.averageEfficiency;
    const labels = entries.map((entry) => formatChartDate(entry.date));
    const averageLine =
      averageEfficiency === undefined ? [] : labels.map(() => Number(averageEfficiency.toFixed(2)));

    return {
      data: {
        datasets: [
          {
            backgroundColor: AMBER_SOFT,
            borderColor: AMBER,
            data: entries.map((entry) => Number(entry.efficiencyKmPerLiter.toFixed(2))),
            fill: false,
            label: 'צריכה בפועל',
          },
          ...(averageEfficiency === undefined
            ? []
            : [
                {
                  backgroundColor: 'transparent',
                  borderColor: EMERALD,
                  borderDash: [6, 6],
                  data: averageLine,
                  fill: false,
                  label: 'ממוצע בטווח',
                  pointRadius: 0,
                },
              ]),
        ],
        labels,
      } satisfies ChartData<'line'>,
      options: createLineChartOptions((value) => `${formatDecimal(value)} ק״מ/ל`),
    };
  }, [filteredEntries, summary.averageEfficiency]);

  const priceChart = useMemo(() => {
    const entries = filteredEntries.reduce<PricePoint[]>((points, entry) => {
      const derivedPricePerLiter = getPricePerLiter(entry);
      if (derivedPricePerLiter === undefined) return points;
      return [...points, { ...entry, derivedPricePerLiter }];
    }, []);

    if (entries.length === 0) return undefined;

    return {
      data: {
        datasets: [
          {
            backgroundColor: EMERALD_SOFT,
            borderColor: EMERALD,
            data: entries.map((entry) => Number(entry.derivedPricePerLiter.toFixed(2))),
            fill: false,
            label: 'מחיר לליטר',
          },
        ],
        labels: entries.map((entry) => formatChartDate(entry.date)),
      } satisfies ChartData<'line'>,
      options: createLineChartOptions((value) => `₪${formatDecimal(value, 2)}`),
    };
  }, [filteredEntries]);

  const monthlySpendChart = useMemo(() => {
    const totals = new Map<string, number>();

    for (const entry of filteredEntries) {
      if (entry.totalPrice === undefined) continue;
      const monthKey = entry.date.slice(0, 7);
      totals.set(monthKey, (totals.get(monthKey) ?? 0) + entry.totalPrice);
    }

    if (totals.size === 0) return undefined;

    const monthKeys = [...totals.keys()];
    return {
      data: {
        datasets: [
          {
            backgroundColor: ORANGE_SOFT,
            borderColor: ORANGE,
            borderRadius: 8,
            borderWidth: 1,
            data: monthKeys.map((key) => Number((totals.get(key) ?? 0).toFixed(2))),
            label: 'סה״כ חודשי',
          },
        ],
        labels: monthKeys.map(formatMonthKey),
      } satisfies ChartData<'bar'>,
      options: createBarChartOptions((value) => `₪${formatKm(value)}`),
    };
  }, [filteredEntries]);

  const litersChart = useMemo(() => {
    if (filteredEntries.length === 0) return undefined;

    return {
      data: {
        datasets: [
          {
            backgroundColor: AMBER_SOFT,
            borderColor: AMBER,
            borderRadius: 8,
            borderWidth: 1,
            data: filteredEntries.map((entry) => Number(entry.liters.toFixed(1))),
            label: 'ליטרים',
          },
        ],
        labels: filteredEntries.map((entry) => formatChartDate(entry.date)),
      } satisfies ChartData<'bar'>,
      options: createBarChartOptions((value) => `${formatDecimal(value)} ל׳`),
    };
  }, [filteredEntries]);

  const priceTrend = useMemo(() => {
    if (summary.latestPricePerLiter === undefined || summary.trendReferencePrice === undefined) {
      return undefined;
    }

    const delta = summary.latestPricePerLiter - summary.trendReferencePrice;
    if (Math.abs(delta) < 0.01) {
      return {
        label: 'יציב מול הממוצע',
        status: 'optimal' as const,
      };
    }

    return delta > 0
      ? {
          label: '↑ מעל הממוצע',
          status: 'caution' as const,
        }
      : {
          label: '↓ מתחת לממוצע',
          status: 'optimal' as const,
        };
  }, [summary.latestPricePerLiter, summary.trendReferencePrice]);

  return (
    <div className="flex flex-col gap-6">
      <CarSummary car={car} />

      <Card className="flex flex-col gap-4" variant="hero">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-on-surface-variant">פילוח נתונים</span>
            <h1 className="text-xl font-semibold text-on-surface">סטטיסטיקה וגרפים</h1>
            <p className="text-sm text-on-surface-variant">
              כל המדדים והגרפים מתעדכנים לפי הטווח הנבחר.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:min-w-72">
            <SegmentedControl
              onChange={setRange}
              options={[
                { label: 'כל הזמן', value: 'all' },
                { label: 'השנה', value: 'year' },
                { label: `${ROLLING_WINDOW_SIZE} אחרונים`, value: 'last-5' },
              ]}
              value={range}
            />
            <span className="text-xs text-on-surface-variant">
              מוצגים {filteredEntries.length.toString()} תדלוקים · {rangeLabel}
            </span>
          </div>
        </div>
      </Card>

      {filteredEntries.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <h2 className="text-lg font-semibold text-on-surface">אין נתונים בטווח הזה</h2>
          <p className="max-w-sm text-sm text-on-surface-variant">
            נסו לבחור טווח אחר כדי לראות מדדים וגרפים, או הוסיפו תדלוקים חדשים.
          </p>
        </Card>
      ) : (
        <>
          {needsAnotherFuelingForEfficiency ? (
            <Card className="flex flex-col gap-2 border border-primary/20 bg-primary/10">
              <h2 className="text-base font-semibold text-on-surface">עוד רגע תהיה כאן יעילות</h2>
              <p className="text-sm text-on-surface-variant">
                בטווח שבחרתם יש כרגע תדלוק אחד בלבד, ולכן צריך עוד תדלוק אחד כדי לחשב יעילות.
              </p>
            </Card>
          ) : null}

          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-on-surface">צריכה וביצועים</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <StatTile
                label="ממוצע צריכה רובסטי"
                value={
                  <MetricCardValue
                    primary={formatEfficiencyValue(summary.averageEfficiency)}
                    secondary={
                      needsAnotherFuelingForEfficiency
                        ? 'עוד תדלוק אחד כדי לחשב יעילות'
                        : 'ממוצע רובסטי'
                    }
                  />
                }
              />
              <StatTile
                label={`ממוצע ${ROLLING_WINDOW_SIZE} אחרונים`}
                value={
                  <MetricCardValue
                    primary={formatEfficiencyValue(summary.rollingAverageEfficiency)}
                    secondary={
                      needsAnotherFuelingForEfficiency
                        ? 'עוד תדלוק אחד כדי לחשב יעילות'
                        : 'חלון מתגלגל'
                    }
                  />
                }
              />
              <StatTile
                label="התדלוק הטוב ביותר"
                value={
                  <MetricCardValue
                    primary={formatEfficiencyValue(summary.bestFill?.efficiencyKmPerLiter)}
                    secondary={
                      summary.bestFill
                        ? formatEntryDate(summary.bestFill.date)
                        : needsAnotherFuelingForEfficiency
                          ? 'עוד תדלוק אחד כדי לחשב יעילות'
                          : 'אין עדיין מספיק נתונים'
                    }
                  />
                }
              />
              <StatTile
                label="התדלוק החלש ביותר"
                value={
                  <MetricCardValue
                    primary={formatEfficiencyValue(summary.worstFill?.efficiencyKmPerLiter)}
                    secondary={
                      summary.worstFill
                        ? formatEntryDate(summary.worstFill.date)
                        : needsAnotherFuelingForEfficiency
                          ? 'עוד תדלוק אחד כדי לחשב יעילות'
                          : 'אין עדיין מספיק נתונים'
                    }
                  />
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-on-surface">עלות ותדלוקים</h2>
              {priceTrend && <Chip status={priceTrend.status}>{priceTrend.label}</Chip>}
            </div>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <StatTile label="סה״כ מרחק" unit="ק״מ" value={formatKm(summary.totalDistance)} />
              <StatTile label="סה״כ דלק" unit="ל׳" value={formatLiters(summary.totalLiters)} />
              <StatTile
                label="סה״כ הוצאה"
                value={
                  <MetricCardValue
                    primary={formatCurrency(summary.totalPricedSpend)}
                    secondary={
                      summary.totalSpendMissingCount > 0
                        ? `חסרים מחירים ב-${summary.totalSpendMissingCount.toString()} תדלוקים`
                        : `מכסה ${summary.totalSpendCoverage.toString()} תדלוקים`
                    }
                  />
                }
              />
              <StatTile label="מספר תדלוקים" value={summary.fillCount.toString()} />
              <StatTile
                label="ממוצע ₪ לליטר"
                value={
                  <MetricCardValue
                    primary={formatCurrency(summary.trendReferencePrice)}
                    secondary={
                      summary.pricePointCount > 0
                        ? `מבוסס על ${summary.pricePointCount.toString()} תדלוקים`
                        : 'אין מחירים זמינים'
                    }
                  />
                }
              />
              <StatTile
                label="מחיר אחרון לליטר"
                value={formatCurrency(summary.latestPricePerLiter)}
              />
              <StatTile
                label="עלות ל-100 ק״מ"
                value={
                  <MetricCardValue
                    primary={formatCurrency(summary.costPer100Km)}
                    secondary={
                      summary.pricedIntervalCount > 0
                        ? `מבוסס על ${summary.pricedIntervalCount.toString()} מרווחים`
                        : 'אין מספיק מחירים'
                    }
                  />
                }
              />
              <StatTile label="עלות לק״מ" value={formatCurrency(summary.costPerKm)} />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-on-surface">קצב שימוש</h2>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <StatTile
                label="ימים ממוצעים בין תדלוקים"
                value={formatDecimal(summary.averageDaysBetweenFills)}
                unit="ימים"
              />
              <StatTile
                label="ק״מ ממוצעים בין תדלוקים"
                value={formatKm(summary.averageKmBetweenFills)}
                unit="ק״מ"
              />
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard
              description="צריכת הדלק לכל תדלוק, עם קו ממוצע רובסטי עבור הטווח הנבחר."
              emptyMessage="יופיע אחרי שיהיו לפחות שני תדלוקים עם צריכה מחושבת."
              title="צריכה לאורך זמן"
            >
              {efficiencyChart && (
                <Line data={efficiencyChart.data} options={efficiencyChart.options} />
              )}
            </ChartCard>

            <ChartCard
              description="מחיר ליטר לאורך זמן, כולל חישוב מתוך סכום כולל כשצריך."
              emptyMessage="אין עדיין מחירי ליטר זמינים להצגה."
              title="₪ לליטר לאורך זמן"
            >
              {priceChart && <Line data={priceChart.data} options={priceChart.options} />}
            </ChartCard>

            <ChartCard
              description="סכום ההוצאה על דלק בכל חודש קלנדרי."
              emptyMessage="אין עדיין סכומי תדלוק חודשיים להצגה."
              title="הוצאה חודשית"
            >
              {monthlySpendChart && (
                <Bar data={monthlySpendChart.data} options={monthlySpendChart.options} />
              )}
            </ChartCard>

            <ChartCard
              description="כמות הליטרים שנכנסה בכל תדלוק."
              emptyMessage="יופיע אחרי שיהיה לפחות תדלוק אחד בטווח."
              title="ליטרים לכל תדלוק"
            >
              {litersChart && <Bar data={litersChart.data} options={litersChart.options} />}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
};

export const StatisticsPage = () => {
  const { car, error, fuelEntries, refresh, status } = useCarData();

  if (status === 'loading' || status === 'idle') return <LoadingState />;
  if (status === 'error')
    return <ErrorState message={error ?? 'שגיאה לא צפויה.'} onRetry={() => void refresh()} />;
  if (status === 'needs-setup') return <NeedsSetupState />;
  if (!car) return <LoadingState />;
  if (fuelEntries.length === 0)
    return (
      <EmptyState
        car={car}
        message="הסטטיסטיקה תופיע אחרי התדלוק הראשון. ברגע שיהיו נתונים, נראה כאן ממוצעים, מחירים וגרפים."
      />
    );

  return <ReadyStatistics car={car} fuelEntries={fuelEntries} />;
};
