"use client";

import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface KpiChartsProps {
  aggregations: {
    positionDistribution: Array<{ name: string; value: number }>;
    educationDistribution: Array<{ name: string; value: number }>;
    experienceDistribution: Array<{ name: string; value: number }>;
    ageDistribution: Array<{ name: string; value: number }>;
    bmiDistribution: Array<{ name: string; value: number }>;
    heightDistribution: Array<{ name: string; value: number }>;
    totalCandidates: number;
    averageExperience: number;
  };
}

export function PositionDistributionBar({ data }: { data: Array<{ name: string; value: number }> }) {
  const chartData = data.map((d) => ({
    ...d,
    percentage: data.reduce((s, i) => s + i.value, 0) > 0 
      ? ((d.value / data.reduce((s, i) => s + i.value, 0)) * 100).toFixed(1) + "%" 
      : "0%",
  }));

  return (
    <BarChart data={chartData} layout="horizontal" height={320} />
  );
}

export function PositionDistributionDonut({ data }: { data: Array<{ name: string; value: number }> }) {
  const total = data.reduce((s, i) => s + i.value, 0);
  return (
    <div>
      <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} total={total} />
      <div className="mt-4 space-y-2">
        {data.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <span>•</span>
            <span>{p.name}: {p.value} ({total > 0 ? ((p.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EducationDegreeDonut({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  return (
    <div>
      <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} total={total} />
      <div className="mt-4 space-y-2">
        {data.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <span>•</span>
            <span>{p.name}: {p.value} ({total > 0 ? ((p.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExperienceDonut({ data, avgExp }: { data: Array<{ name: string; value: number }>; avgExp: number }) {
  const segments = ["<1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];
  const total = data.reduce((s, i) => s + i.value, 0);
  const orderedData = segments.map((seg) => {
    const found = data.find((d) => d.name === seg);
    return found || { name: seg, value: 0 };
  });

  return (
    <div>
      <DonutChart data={data} height={260} centerLabel={`Avg: ${avgExp.toFixed(1)} Years`} centerTotal={undefined} segments={segments} total={total} />
      <div className="mt-4 space-y-2">
        {orderedData.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <span>•</span>
            <span>{p.name}: {p.value} ({total > 0 ? ((p.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgeGroupDonut({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  const segments = ["<25", "25-29", "30-34", "35-39", "40-44", "45+"];
  const orderedData = segments.map((seg) => {
    const found = data.find((d) => d.name === seg);
    return found || { name: seg, value: 0 };
  });

  return (
    <div>
      <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} segments={segments} total={total} />
      <div className="mt-4 space-y-2">
        {orderedData.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <span>•</span>
            <span>{p.name}: {p.value} ({total > 0 ? ((p.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BMIDonut({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  const segments = ["<=23", ">23"];
  const orderedData = segments.map((seg) => {
    const found = data.find((d) => d.name === seg);
    return found || { name: seg, value: 0 };
  });

  return (
    <div>
      <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} segments={segments} total={total} />
      <div className="mt-4 space-y-2">
        {orderedData.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <span>•</span>
            <span>{p.name}: {p.value} ({total > 0 ? ((p.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeightDistributionDonut({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  const segments = ["<=155", ">155"];
  const orderedData = segments.map((seg) => {
    const found = data.find((d) => d.name === seg);
    return found || { name: seg, value: 0 };
  });

  return (
    <div>
      <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} segments={segments} total={total} />
      <div className="mt-4 space-y-2">
        {orderedData.map((p) => (
          <div key={p.name} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <span>•</span>
            <span>{p.name}: {p.value} ({total > 0 ? ((p.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KpiCharts({ aggregations }: KpiChartsProps) {
  const { positionDistribution, educationDistribution, experienceDistribution, ageDistribution, bmiDistribution, heightDistribution, totalCandidates, averageExperience } = aggregations;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Position Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PositionDistributionBar data={positionDistribution} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education Degrees</CardTitle>
        </CardHeader>
        <CardContent>
          <EducationDegreeDonut data={educationDistribution} total={totalCandidates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Years of Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <ExperienceDonut data={experienceDistribution} avgExp={averageExperience} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Age Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <AgeGroupDonut data={ageDistribution} total={totalCandidates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>BMI Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <BMIDonut data={bmiDistribution} total={totalCandidates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Height Distribution (CM)</CardTitle>
        </CardHeader>
        <CardContent>
          <HeightDistributionDonut data={heightDistribution} total={totalCandidates} />
        </CardContent>
      </Card>
    </div>
  );
}