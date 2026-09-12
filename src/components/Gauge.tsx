import { cn } from '../lib/cn';

export interface GaugeProps {
  max: number;
  min: number;
  value: number;
  average?: number;
  className?: string;
  unit?: string;
}

const CENTER_X = 100;
const CENTER_Y = 100;
const TRACK_R = 80;
const NEEDLE_R = 65;
const MARKER_INNER_R = 72;
const MARKER_OUTER_R = 90;

const pointAt = (r: number, thetaDeg: number) => {
  const theta = (thetaDeg * Math.PI) / 180;
  return {
    x: CENTER_X + r * Math.cos(theta),
    y: CENTER_Y - r * Math.sin(theta),
  };
};

const angleForValue = (value: number, min: number, max: number) => {
  const percent = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return 180 - percent * 180;
};

const arcPath = (r: number, thetaStart: number, thetaEnd: number) => {
  const start = pointAt(r, thetaStart);
  const end = pointAt(r, thetaEnd);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
};

export const Gauge = ({ average, className, max, min, unit = 'ק״מ לליטר', value }: GaugeProps) => {
  const needleTip = pointAt(NEEDLE_R, angleForValue(value, min, max));

  const avgAngle = average !== undefined ? angleForValue(average, min, max) : undefined;
  const avgInner = avgAngle !== undefined ? pointAt(MARKER_INNER_R, avgAngle) : undefined;
  const avgOuter = avgAngle !== undefined ? pointAt(MARKER_OUTER_R, avgAngle) : undefined;

  const midLabel = Math.round((min + max) / 2);

  return (
    <div className={cn('mx-auto w-full max-w-80', className)}>
      <svg viewBox="0 0 200 170" className="block w-full overflow-visible">
        <path
          d={arcPath(TRACK_R, 180, 120)}
          className="fill-none stroke-tertiary/55"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={arcPath(TRACK_R, 120, 60)}
          className="fill-none stroke-primary/70"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={arcPath(TRACK_R, 60, 0)}
          className="fill-none stroke-secondary/75"
          strokeWidth={14}
          strokeLinecap="round"
        />

        <text
          x={14}
          y={115}
          textAnchor="middle"
          className="fill-on-surface-variant font-mono text-[9px]"
        >
          {min}
        </text>
        <text
          x={100}
          y={14}
          textAnchor="middle"
          className="fill-on-surface-variant font-mono text-[9px]"
        >
          {midLabel}
        </text>
        <text
          x={186}
          y={115}
          textAnchor="middle"
          className="fill-on-surface-variant font-mono text-[9px]"
        >
          {max}
        </text>

        {avgInner && avgOuter && (
          <line
            x1={avgInner.x}
            y1={avgInner.y}
            x2={avgOuter.x}
            y2={avgOuter.y}
            className="stroke-on-surface-variant"
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        <line
          x1={CENTER_X}
          y1={CENTER_Y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="#ffffff"
          strokeWidth={3.5}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.65))' }}
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={9}
          className="fill-surface-container-high stroke-ghost-strong"
          strokeWidth={1}
        />
        <circle cx={CENTER_X} cy={CENTER_Y} r={4} fill="#ffffff" />

        <text
          x={100}
          y={134}
          textAnchor="middle"
          className="fill-white font-mono text-[30px] font-bold"
          style={{ direction: 'ltr', letterSpacing: '-0.02em', unicodeBidi: 'isolate' }}
        >
          {value.toFixed(1)}
        </text>
        <text
          x={100}
          y={154}
          textAnchor="middle"
          className="fill-on-surface-variant font-hebrew text-xs font-medium"
        >
          {unit}
        </text>
      </svg>
    </div>
  );
};
