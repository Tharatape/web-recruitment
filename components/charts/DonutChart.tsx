"use client";

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  centerLabel?: string;
  centerTotal?: number;
}

const COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe",
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#8b5cf6",
];

export function DonutChart({ data, height = 260, centerLabel, centerTotal }: DonutChartProps) {
  return (
    <div className="w-full relative">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={data.length > 0 ? "58%" : "0%"}
            outerRadius={data.length > 0 ? "80%" : "50%"}
            paddingAngle={2}
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive={false}
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
      {centerLabel && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          {centerTotal !== undefined && centerTotal > 0 && (
            <span className="text-2xl font-bold text-[var(--foreground)]">{centerTotal}</span>
          )}
          <span className={`text-xs text-[var(--text-muted)] ${centerTotal === undefined || centerTotal === 0 ? "text-2xl font-bold text-[var(--foreground)]" : ""}`}>{centerLabel}</span>
        </div>
      )}
    </div>
  );
}