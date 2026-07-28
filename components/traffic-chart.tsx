"use client";

import { useMemo, useState } from "react";
import type { TrendPoint } from "@/lib/analytics";
import { cn, formatDate } from "@/lib/utils";

const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

const WIDTH = 640;
const HEIGHT = 150;
const PAD_TOP = 10;
const PAD_BOTTOM = 18;

/**
 * A read-at-a-glance area chart for the overview panel.
 *
 * The y-axis always starts at zero — a chart that crops the baseline turns a
 * flat week into a dramatic climb, and these are numbers people make decisions
 * on. When there is nothing recorded, the chart says so rather than drawing a
 * flat line that looks like measured zero traffic.
 */
export function TrafficChart({
  points,
  range,
  onRangeChange,
  label,
  unit,
}: {
  points: TrendPoint[];
  range: Range;
  onRangeChange: (range: Range) => void;
  label: string;
  unit: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const { peak, total, area, line, coordinates } = useMemo(() => {
    const values = points.map(point => point.value);
    const highest = Math.max(...values, 1);
    const step = points.length > 1 ? (WIDTH - 8) / (points.length - 1) : 0;
    const y = (value: number) => PAD_TOP + (1 - value / highest) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
    const coords = points.map((point, index) => ({ x: 4 + index * step, y: y(point.value), point }));
    const path = coords.map((coordinate, index) => `${index === 0 ? "M" : "L"}${coordinate.x.toFixed(1)} ${coordinate.y.toFixed(1)}`).join(" ");

    return {
      peak: highest,
      total: values.reduce((sum, value) => sum + value, 0),
      line: path,
      area: `${path} L${(coords.at(-1)?.x ?? 0).toFixed(1)} ${HEIGHT - PAD_BOTTOM} L${(coords[0]?.x ?? 0).toFixed(1)} ${HEIGHT - PAD_BOTTOM} Z`,
      coordinates: coords,
    };
  }, [points]);

  const empty = total === 0;
  const active = hovered === null ? null : coordinates[hovered];

  return (
    <div className="traffic-chart">
      <div className="traffic-chart-head">
        <div>
          <strong>{empty ? "—" : total.toLocaleString()}</strong>
          <small>{label} · last {range} days</small>
        </div>
        <div className="range-switch" role="group" aria-label="Chart range">
          {RANGES.map(value => (
            <button
              key={value}
              type="button"
              className={cn(value === range && "active")}
              aria-pressed={value === range}
              onClick={() => onRangeChange(value)}
            >
              {value}d
            </button>
          ))}
        </div>
      </div>

      <div className={cn("traffic-chart-plot", empty && "is-empty")}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`${label} over the last ${range} days. ${empty ? "Nothing recorded yet." : `${total} in total, peaking at ${peak} on a single day.`}`}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="traffic-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--green)" stopOpacity=".28" />
              <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {!empty && <path className="traffic-area" d={area} fill="url(#traffic-fill)" />}
          <path className={cn("traffic-line", empty && "flat")} d={line} />
          {active && (
            <line className="traffic-cursor" x1={active.x} x2={active.x} y1={PAD_TOP - 4} y2={HEIGHT - PAD_BOTTOM} />
          )}
          {active && !empty && <circle className="traffic-dot" cx={active.x} cy={active.y} r="4" />}
          {/* One invisible column per day: a comfortable hover target even at 90 days. */}
          {coordinates.map((coordinate, index) => (
            <rect
              key={coordinate.point.date}
              x={coordinate.x - (WIDTH - 8) / Math.max(points.length - 1, 1) / 2}
              y="0"
              width={(WIDTH - 8) / Math.max(points.length - 1, 1)}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHovered(index)}
            />
          ))}
        </svg>

        {empty && <p className="traffic-empty">Nothing recorded yet</p>}

        {active && !empty && (
          <div className="traffic-readout" style={{ left: `${(active.x / WIDTH) * 100}%` }}>
            <strong>{active.point.value.toLocaleString()} {unit}</strong>
            <small>{formatDate(active.point.date)}</small>
          </div>
        )}
      </div>

      <div className="traffic-axis">
        <span>{formatDate(points[0]?.date ?? "")}</span>
        <span>{formatDate(points.at(-1)?.date ?? "")}</span>
      </div>
    </div>
  );
}
