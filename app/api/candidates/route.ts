import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/data/db';
import { getCandidatesWithFilters, getCandidateLogs, getUniqueRecruiters, getCandidateByUniqueId } from '@/data/repositories/candidateRepository';

initializeDatabase();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get('limit');
  const uniqueId = searchParams.get('uniqueId');
  
  if (uniqueId) {
    const candidate = getCandidateByUniqueId(uniqueId);
    return NextResponse.json(candidate || null);
  }
  
  const filters = {
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    owner: searchParams.get('owner') || undefined,
    search: searchParams.get('search') || undefined,
    status: searchParams.getAll('status'),
    position: searchParams.getAll('position'),
    limit: limitParam ? Number(limitParam) : undefined,
    offset: Number(searchParams.get('offset')) || 0,
    includeLogs: searchParams.get('includeLogs') === 'true',
  };

  const candidates = getCandidatesWithFilters(filters);
  return NextResponse.json(candidates);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, candidateId } = body;

  if (action === 'getLogs' && candidateId) {
    const logs = getCandidateLogs(candidateId);
    return NextResponse.json(logs);
  }

  if (action === 'getRecruiters') {
    const recruiters = getUniqueRecruiters();
    return NextResponse.json(recruiters);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}