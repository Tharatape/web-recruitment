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
    <BarChart data={chartData} layout="vertical" height={320} />
  );
}

export function EducationDegreeDonut({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  return (
    <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} />
  );
}

export function ExperienceDonut({ data, avgExp }: { data: Array<{ name: string; value: number }>; avgExp: number }) {
  return (
    <DonutChart data={data} height={260} centerLabel={`Avg: ${avgExp.toFixed(1)} Years`} centerTotal={undefined} />
  );
}

export function AgeGroupDonut({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  return (
    <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} />
  );
}

export function BMIDonut({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  return (
    <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} />
  );
}

export function HeightDistributionDonut({ data, total }: { data: Array<{ name: string; value: number }>; total: number }) {
  return (
    <DonutChart data={data} height={260} centerLabel="Total" centerTotal={total} />
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
          <CardTitle>Height Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <HeightDistributionDonut data={heightDistribution} total={totalCandidates} />
        </CardContent>
      </Card>
    </div>
  );
}