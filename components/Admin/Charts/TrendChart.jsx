"use client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const ACCENT = "#f97316";
const AXIS_TICK = { fontSize: 11, fill: "#94a3b8" };

function TrendTooltip({ active, payload, label, format, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900 tabular-nums">
        {format(payload[0].value)}
        {unit ? <span className="ml-1 font-medium text-gray-500">{unit}</span> : null}
      </p>
    </div>
  );
}

/**
 * Single-series daily trend. `kind="area"` for continuous activity,
 * `kind="bar"` for discrete daily counts.
 */
export default function TrendChart({
  data,
  dataKey,
  kind = "area",
  height = 240,
  format = (v) => v.toLocaleString("en-US"),
  unit,
}) {
  const common = {
    data,
    margin: { top: 4, right: 4, left: 0, bottom: 0 },
  };
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
      <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
      <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
      <Tooltip
        content={<TrendTooltip format={format} unit={unit} />}
        cursor={kind === "bar" ? { fill: "#f8fafc" } : { stroke: "#cbd5e1", strokeWidth: 1 }}
      />
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      {kind === "bar" ? (
        <BarChart {...common} barCategoryGap={2}>
          {axes}
          <Bar dataKey={dataKey} fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      ) : (
        <AreaChart {...common}>
          <defs>
            <linearGradient id={`trend-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          {axes}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={ACCENT}
            strokeWidth={2}
            fill={`url(#trend-${dataKey})`}
            dot={false}
            activeDot={{ r: 4, fill: ACCENT, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}
