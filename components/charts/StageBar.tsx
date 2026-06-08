"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface Segment {
  name: string;
  value: number;
  color: string;
}

interface StageBarProps {
  name: string;
  segments: Segment[];
  height?: number;
  yAxisMax?: number;
}

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-3 shadow-sm text-sm">
      <p className="font-semibold text-[var(--foreground)] mb-2">{label}</p>
      {payload.map((entry) => (
        entry.value > 0 && (
          <p key={entry.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--text-secondary)]">{entry.name}:</span>
            <span className="font-semibold">{entry.value}</span>
          </p>
        )
      ))}
    </div>
  );
}

export function StageBar({ name, segments, height = 200, yAxisMax }: StageBarProps) {
  const data = [{
    name,
    total: segments.reduce((sum, seg) => sum + seg.value, 0),
    ...segments.reduce((acc, seg) => ({ ...acc, [seg.name]: seg.value }), {}),
  }];

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 20, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} allowDecimals={false} domain={yAxisMax ? [0, yAxisMax] : undefined} />
          <Tooltip content={<CustomTooltip />} />
          {segments.map((seg) => (
            <Bar
              key={`${name}___${seg.name}`}
              dataKey={seg.name}
              stackId={name}
              name={seg.name}
            >
              <Cell fill={seg.color} />
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}