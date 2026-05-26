import { NextResponse } from 'next/server';
import { initializeDatabase, db } from '@/data/db';
import { seedReferenceData, seedCandidates, seedJDs, generateCandidates } from '@/data/db/seed';

export async function GET() {
  try {
    initializeDatabase();
    
    // Update existing candidates to have unique_id (for migrations)
    const candidatesWithoutUniqueId = db.prepare(
      "SELECT id FROM candidates WHERE unique_id IS NULL OR unique_id = ''"
    ).all() as { id: string }[];
    
    if (candidatesWithoutUniqueId.length > 0) {
      const maxUniqueId = db.prepare(
        "SELECT MAX(CAST(unique_id AS INTEGER)) as maxId FROM candidates WHERE unique_id IS NOT NULL AND unique_id != ''"
      ).get() as { maxId: number | null };
      const startId = (maxUniqueId.maxId || 0) + 1;
      
      for (let i = 0; i < candidatesWithoutUniqueId.length; i++) {
        const candidate = candidatesWithoutUniqueId[i];
        db.prepare('UPDATE candidates SET unique_id = ? WHERE id = ?')
          .run(String(startId + i).padStart(5, '0'), candidate.id);
      }
    }
    
    // Ensure unique_id has values for all candidates - if still missing, assign them
    const allCandidates = db.prepare('SELECT id FROM candidates').all() as { id: string }[];
    if (allCandidates.length > 0) {
      for (let i = 0; i < allCandidates.length; i++) {
        const candidate = allCandidates[i];
        const existing = db.prepare('SELECT unique_id FROM candidates WHERE id = ?').get(candidate.id) as { unique_id: string | null };
        if (!existing.unique_id) {
          db.prepare('UPDATE candidates SET unique_id = ? WHERE id = ?')
            .run(String(i + 1).padStart(5, '0'), candidate.id);
        }
      }
    }
    
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