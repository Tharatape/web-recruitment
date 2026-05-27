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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'reset') {
      db.prepare('DELETE FROM activity_logs').run();
      db.prepare('DELETE FROM candidates').run();
      db.prepare('DELETE FROM jds').run();
      db.prepare('DELETE FROM jd_checklists').run();
      
      seedReferenceData();
      seedCandidates(generateCandidates());
      seedJDs();
      
      return NextResponse.json({ 
        message: 'Database reset and reseeded',
        count: db.prepare('SELECT COUNT(*) as count FROM activity_logs').get()
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}