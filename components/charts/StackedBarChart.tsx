"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";

interface StageSegment {
  name: string;
  value: number;
  color: string;
}

interface StageBar {
  name: string;
  stackId?: string;
  segments: StageSegment[];
}

interface StackedBarChartProps {
  data: StageBar[];
  height?: number;
}

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-3 shadow-sm text-sm">
      <p className="font-semibold text-[var(--foreground)] mb-2">{label}</p>
      {payload.map(
        (entry) =>
          entry.value > 0 && (
            <p key={entry.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-[var(--text-secondary)]">{entry.name}:</span>
              <span className="font-semibold">{entry.value}</span>
            </p>
          )
      )}
    </div>
  );
}

function UniqueLegend({ segments }: { segments: StageSegment[][] }) {
  const seen = new Set<string>();
  const legendItems: StageSegment[] = [];
  segments.forEach((stageSegs) => {
    stageSegs.forEach((seg) => {
      if (!seen.has(seg.name)) {
        seen.add(seg.name);
        legendItems.push(seg);
      }
    });
  });
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
      {legendItems.map((seg) => (
        <div key={seg.name} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: seg.color }} />
          <span>{seg.name}</span>
        </div>
      ))}
    </div>
  );
}

export function StackedBarChart({ data, height = 300 }: StackedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap={30}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
          padding={{ left: 40, right: 40 }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<UniqueLegend segments={data.map((s) => s.segments)} />} />
        {data.map((stage) =>
          stage.segments.map((seg) => (
            <Bar
              key={`${stage.name}___${seg.name}`}
              dataKey={(d: StageBar) =>
                (d.segments.find((s: StageSegment) => s.name === seg.name)?.value || 0) as number
              }
              stackId={stage.stackId || stage.name}
              name={seg.name}
            >
              {data.map((d) => (
                <Cell
                  key={d.name}
                  fill={d.name === stage.name ? seg.color : "transparent"}
                  stroke="none"
                />
              ))}
            </Bar>
          ))
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
