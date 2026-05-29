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

  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            domain={[0, 'dataMax']}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            width={120}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm">
                  <div className="font-medium">{d.name}</div>
                  <div className="text-[var(--text-secondary)]">{d.value} {d.percentage && `(${d.percentage})`}</div>
                </div>
              );
            }}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="value" barSize={barSize} radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={data[i].color || BLUE_COLORS[i % BLUE_COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} layout="horizontal" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
          angle={-45}
          textAnchor="end"
          height={70}
          type="category"
          tickCount={data.length}
          interval={0}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} domain={[0, 'dataMax']} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm">
                <div className="font-medium">{d.name}</div>
                <div className="text-[var(--text-secondary)]">{d.value} {d.percentage && `(${d.percentage})`}</div>
              </div>
            );
          }}
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
