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

interface BarChartProps {
  data: { name: string; value: number; color?: string; percentage?: string }[];
  layout?: "horizontal" | "vertical";
  height?: number;
  barSize?: number;
}

export function BarChart({
  data,
  layout = "horizontal",
  height = 300,
  barSize = 32,
}: BarChartProps) {
  const BLUE_COLORS = [
    "#2563eb", "#3b82f6", "#1d4ed8", "#60a5fa", "#1e40af",
    "#2563eb", "#3b82f6", "#1d4ed8", "#60a5fa",
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} layout={layout} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="value" barSize={barSize} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={data[i].color || BLUE_COLORS[i % BLUE_COLORS.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
