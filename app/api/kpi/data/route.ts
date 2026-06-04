import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/data/db';
import { getKpiAggregations, getKpiCandidateDetails, exportKpitoExcel } from '@/data/repositories/kpiRepository';

export const dynamic = 'force-dynamic';

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
    const candidates = getKpiCandidateDetails(filters);
    return NextResponse.json({ aggregations, candidates });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();
    const body = await request.json();
    const { action, ...filters } = body;

    if (action === 'export') {
      const buffer = exportKpitoExcel({
        search: filters.search,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        owner: filters.owner,
      });
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="kpi-data.xlsx"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}