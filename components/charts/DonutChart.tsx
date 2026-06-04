"use client";

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  centerLabel?: string;
  centerTotal?: number;
  segments?: string[];
  total?: number;
}

const COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe",
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#8b5cf6",
];

export function DonutChart({ data, height = 260, centerLabel, centerTotal, segments, total }: DonutChartProps) {
  const orderedData = segments
    ? segments.map((seg) => {
        const found = data.find((d) => d.name === seg);
        return found || { name: seg, value: 0 };
      })
    : data;

return (
    <div className="w-full relative" style={{ isolation: 'isolate' }}>
      {centerLabel && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none" 
          style={{ zIndex: 1 }}
        >
          {centerTotal !== undefined && centerTotal > 0 && (
            <span className="text-2xl font-bold text-[var(--foreground)]">{centerTotal}</span>
          )}
          <span className={`text-xs text-[var(--text-muted)] ${centerTotal === undefined || centerTotal === 0 ? "text-2xl font-bold text-[var(--foreground)]" : ""}`}>{centerLabel}</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={orderedData}
            cx="50%"
            cy="50%"
            innerRadius={orderedData.length > 0 ? "58%" : "0%"}
            outerRadius={orderedData.length > 0 ? "80%" : "50%"}
            paddingAngle={2}
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {orderedData.map((_, i) => (
              <Cell key={i} fill={orderedData[i].color || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
            contentStyle={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              padding: '8px 12px',
            }}
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const dataPoint = payload[0].payload;
                const actualTotal = total !== undefined ? total : orderedData.reduce((s, i) => s + i.value, 0);
                const percentage = actualTotal > 0 ? ((dataPoint.value / actualTotal) * 100).toFixed(1) : 0;
                return (
                  <div style={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                    minWidth: '120px',
                  }}>
                    <span className="font-medium text-[var(--foreground)]">{dataPoint.name}: {dataPoint.value} ({percentage}%)</span>
                  </div>
                );
              }
              return null;
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}