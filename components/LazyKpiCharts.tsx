"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import KpiCharts from "@/components/charts/KpiCharts";
import type { KpiAggregations } from "@/data/repositories/kpiRepository";

const emptyAggregations: KpiAggregations = {
  positionDistribution: [],
  educationDistribution: [],
  experienceDistribution: [],
  ageDistribution: [],
  bmiDistribution: [],
  heightDistribution: [],
  totalCandidates: 0,
  averageExperience: 0,
};

interface LazyKpiChartsProps {
  dateFrom: string;
  dateTo: string;
  owner: string;
}

export function LazyKpiCharts({ dateFrom, dateTo, owner }: LazyKpiChartsProps) {
  const [aggregations, setAggregations] = useState<KpiAggregations>(emptyAggregations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAggregations = async () => {
      setLoading(true);
      setError(null);
      try {
        const qp = new URLSearchParams({ type: "aggregations" });
        if (dateFrom) qp.set("dateFrom", dateFrom);
        if (dateTo) qp.set("dateTo", dateTo);
        if (owner === "no-owner") qp.set("owner", "no-owner");
        else if (owner) qp.set("owner", owner);

        const res = await fetch(`/api/kpi/data?${qp.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch KPI data: ${res.status}`);
        }
        const data = await res.json();
        setAggregations(data.aggregations);
      } catch (err) {
        setError(String(err));
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregations();
  }, [dateFrom, dateTo, owner]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Position Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] animate-pulse bg-gray-100 rounded" />
          </CardContent>
        </Card>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <span className="h-6 bg-gray-200 rounded w-24 animate-pulse block" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] animate-pulse bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center py-8 text-[var(--accent-red)]">Error loading charts: {error}</p>
    );
  }

  return <KpiCharts aggregations={aggregations} />;
}