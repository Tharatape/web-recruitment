import { NextResponse } from 'next/server';
import { initializeDatabase, db } from '@/data/db';
import { seedReferenceData, seedCandidates, seedJDs, generateCandidates } from '@/data/db/seed';

export async function GET() {
  try {
    initializeDatabase();
    
    const candidateCount = db.prepare('SELECT COUNT(*) as count FROM candidates').get() as { count: number };
    
    if (candidateCount.count === 0) {
      seedReferenceData();
      seedCandidates(generateCandidates());
      seedJDs();
    }

    return NextResponse.json({ 
      message: 'Database initialized', 
      candidateCount: db.prepare('SELECT COUNT(*) as count FROM candidates').get() 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}