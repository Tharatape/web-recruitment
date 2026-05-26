import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, db } from '@/data/db';
import { getUniqueRecruiters } from '@/data/repositories/candidateRepository';

initializeDatabase();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get('limit')) || 50;
    const offset = Number(searchParams.get('offset')) || 0;
    const days = searchParams.get('days');
    const statusFilter = searchParams.get('status');
    const actionTypeFilter = searchParams.get('action_type');
    const recruiterFilter = searchParams.get('recruiter');
    const searchFilter = searchParams.get('search');

    let query = `
      SELECT 
        al.id,
        c.id as candidate_id,
        c.name as candidate_name,
        al.date,
        al.time,
        o.name as recruiter,
        s.name as status,
        al.note,
        CASE 
          WHEN p.name IS NOT NULL THEN p.name
          ELSE 'System'
        END as position,
        al.action_type
      FROM activity_logs al
      LEFT JOIN candidates c ON al.candidate_id = c.id
      LEFT JOIN owners o ON al.recruiter_id = o.id
      LEFT JOIN statuses s ON al.status_id = s.id
      LEFT JOIN positions p ON c.position_id = p.id
    `;

    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (days !== null && days !== undefined) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - Number(days));
      conditions.push('al.date >= ?');
      params.push(cutoffDate.toISOString().split('T')[0]);
    }

    if (statusFilter) {
      conditions.push('s.name = ?');
      params.push(statusFilter);
    }

    if (actionTypeFilter) {
      conditions.push('al.action_type = ?');
      params.push(actionTypeFilter);
    }

    if (recruiterFilter) {
      conditions.push('o.name = ?');
      params.push(recruiterFilter);
    }

    if (searchFilter) {
      conditions.push('(c.name LIKE ? OR c.email LIKE ? OR al.note LIKE ?)');
      const searchPattern = `%${searchFilter}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY al.date DESC, al.time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const activities = db.prepare(query).all(...params);

    return NextResponse.json(activities || []);
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'getRecruiters') {
      const recruiters = getUniqueRecruiters();
      return NextResponse.json(recruiters || []);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Activity POST error:', error);
    return NextResponse.json([], { status: 200 });
  }
}