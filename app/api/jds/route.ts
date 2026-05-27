import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/data/db';
import { getAllJDs, getJDById, createJD, deleteJD, toggleJDDisabled } from '@/data/repositories/jdRepository';

export async function GET(request: NextRequest) {
  initializeDatabase();
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (id) {
    const jd = getJDById(id);
    return NextResponse.json(jd);
  }

  const jds = getAllJDs();
  return NextResponse.json(jds);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, position, name, id, disabled } = body;

  if (action === 'createJD') {
    const result = createJD(position, name);
    const newJD = getJDById(`JD-${String(result.lastInsertRowid).padStart(4, '0')}`);
    return NextResponse.json(newJD);
  }

  if (action === 'deleteJD' && id) {
    deleteJD(id);
    return NextResponse.json({ success: true });
  }

  if (action === 'toggleDisabled' && id !== undefined && disabled !== undefined) {
    toggleJDDisabled(id, disabled);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}