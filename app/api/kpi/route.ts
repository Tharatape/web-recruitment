import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/data/db';
import { getKpiAggregations } from '@/data/repositories/kpiRepository';

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      owner: searchParams.get('owner') === 'no-owner' ? null : (searchParams.get('owner') || undefined),
    };

    const aggregations = getKpiAggregations(filters);
    return NextResponse.json({ aggregations });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();
    const body = await request.json();
    const { action, ...filters } = body;

    if (action === 'export') {
      const { exportKpiToExcel } = await import('@/data/repositories/kpiRepository');
      const csv = exportKpiToExcel({
        search: filters.search,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        owner: filters.owner,
      });
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="kpi-data.csv"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}