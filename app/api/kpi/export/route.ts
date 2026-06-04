import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/data/db';
import { exportKpitoExcel } from '@/data/repositories/kpiRepository';

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

    const buffer = exportKpitoExcel(filters);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="kpi-data.xlsx"',
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}