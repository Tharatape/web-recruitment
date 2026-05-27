import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/data/db';
import { getDashboardStats } from '@/data/db/stats';
import { getUniqueRecruiters } from '@/data/repositories/candidateRepository';

initializeDatabase();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const owner = searchParams.get('owner') === 'no-owner' ? null : (searchParams.get('owner') || undefined);

  const stats = getDashboardStats({ startDate, endDate, owner });

  return NextResponse.json(stats);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === 'getRecruiters') {
    const recruiters = getUniqueRecruiters();
    return NextResponse.json(recruiters);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}