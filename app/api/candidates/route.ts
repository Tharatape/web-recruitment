import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/data/db';
import { getCandidatesWithFilters, getCandidateLogs, getUniqueRecruiters, getCandidateByUniqueId, getCandidateFullById } from '@/data/repositories/candidateRepository';

export async function GET(request: NextRequest) {
  initializeDatabase();
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get('limit');
  const uniqueId = searchParams.get('uniqueId');
  const fullId = searchParams.get('fullId');
  
  if (uniqueId) {
    const candidate = getCandidateByUniqueId(uniqueId);
    return NextResponse.json(candidate || null);
  }

  if (fullId) {
    const candidate = getCandidateFullById(fullId);
    return NextResponse.json(candidate || null);
  }
  
  const essential = searchParams.get('essential') === 'true';
  const countOnly = searchParams.get('countOnly') === 'true';
  
  const filters = {
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    owner: searchParams.get('owner') === 'no-owner' ? null : (searchParams.get('owner') || undefined),
    search: searchParams.get('search') || undefined,
    status: searchParams.getAll('status'),
    position: searchParams.getAll('position'),
    expMin: searchParams.get('expMin') ? Number(searchParams.get('expMin')) : undefined,
    expMax: searchParams.get('expMax') ? Number(searchParams.get('expMax')) : undefined,
    limit: limitParam ? Number(limitParam) : undefined,
    offset: Number(searchParams.get('offset')) || 0,
    includeLogs: searchParams.get('includeLogs') === 'true',
    essential,
    countOnly,
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