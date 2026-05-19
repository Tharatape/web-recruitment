"use client";

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  centerLabel?: string;
}

const COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe",
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#8b5cf6",
];

export function DonutChart({ data, height = 260, centerLabel }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={data[i].color || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      {centerLabel && total > 0 && (
        <div className="flex flex-col items-center -mt-16 pb-4 pointer-events-none">
          <span className="text-2xl font-bold text-[var(--foreground)]">{total}</span>
          <span className="text-xs text-[var(--text-muted)]">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}
