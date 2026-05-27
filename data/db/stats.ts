import { db } from './index';

export interface DashboardStats {
  total: number;
  today: number;
  lastWeek: number;
  lastMonth: number;
  statusCounts: Record<string, number>;
  positionDistribution: Array<{ name: string; value: number }>;
  stageTotals: Record<string, number>;
  stageData: Array<{
    name: string;
    segments: Array<{ name: string; value: number; color: string }>;
  }>;
}

export function getDashboardStats(filters?: {
  startDate?: string;
  endDate?: string;
  owner?: string | null;
}): DashboardStats {
  const params: unknown[] = [];
  let whereClause = '';

  if (filters?.startDate) {
    params.push(filters.startDate);
    whereClause += ' AND c.date_applied >= ?';
  }
  if (filters?.endDate) {
    params.push(filters.endDate);
    whereClause += ' AND c.date_applied <= ?';
  }
  if (filters?.owner !== undefined) {
    if (filters.owner === null) {
      whereClause += ' AND c.recruiter_id IS NULL';
    } else {
      params.push(filters.owner);
      whereClause += ' AND o.name = ?';
    }
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM candidates c LEFT JOIN owners o ON c.recruiter_id = o.id WHERE 1=1 ${whereClause}`).get(params) as { count: number };

  const todayStr = new Date().toISOString().split('T')[0];
  const today = db.prepare(`SELECT COUNT(*) as count FROM candidates c LEFT JOIN owners o ON c.recruiter_id = o.id WHERE c.date_applied = ? ${whereClause}`).get([todayStr, ...params]) as { count: number };

  const todayDate = new Date();
  const weekAgo = new Date(todayDate);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgoDate = new Date(todayDate);
  monthAgoDate.setMonth(monthAgoDate.getMonth() - 1);

  const lastWeek = db.prepare(`SELECT COUNT(*) as count FROM candidates c LEFT JOIN owners o ON c.recruiter_id = o.id WHERE c.date_applied >= ? ${whereClause}`).get([weekAgo.toISOString().split('T')[0], ...params]) as { count: number };

  const lastMonth = db.prepare(`SELECT COUNT(*) as count FROM candidates c LEFT JOIN owners o ON c.recruiter_id = o.id WHERE c.date_applied >= ? ${whereClause}`).get([monthAgoDate.toISOString().split('T')[0], ...params]) as { count: number };

  const statusCountsRaw = db.prepare(`
    SELECT s.name as status, COUNT(*) as count 
    FROM candidates c 
    JOIN statuses s ON c.status_id = s.id 
    LEFT JOIN owners o ON c.recruiter_id = o.id 
    WHERE 1=1 ${whereClause}
    GROUP BY s.id
  `).all(params) as Array<{ status: string; count: number }>;

  const statusCounts: Record<string, number> = {};
  statusCountsRaw.forEach((row: { status: string; count: number }) => {
    statusCounts[row.status] = row.count;
  });

  const positionDistRaw = db.prepare(`
    SELECT p.name as position, COUNT(*) as count 
    FROM candidates c 
    JOIN positions p ON c.position_id = p.id 
    LEFT JOIN owners o ON c.recruiter_id = o.id 
    WHERE 1=1 ${whereClause}
    GROUP BY p.id 
    ORDER BY count DESC 
    LIMIT 8
  `).all(params) as Array<{ position: string; count: number }>;

  const positionDistribution = positionDistRaw.map((row: { position: string; count: number }) => ({
    name: row.position,
    value: row.count,
  }));

  const stageDataRaw = db.prepare(`
    SELECT 
      c.id as candidate_id,
      MAX(CASE WHEN s.name = 'Shortlisted' THEN 1 ELSE 0 END) as has_shortlisted,
      MAX(CASE WHEN s.name = 'Not Suitable' THEN 1 ELSE 0 END) as has_not_suitable,
      MAX(CASE WHEN s.name = 'Selected' THEN 1 ELSE 0 END) as has_selected,
      MAX(CASE WHEN s.name = 'Offer Accepted' THEN 1 ELSE 0 END) as has_offer_accepted,
      MAX(CASE WHEN s.name = 'Hired' THEN 1 ELSE 0 END) as has_hired,
      MAX(CASE WHEN s.name = 'Applied' THEN 1 ELSE 0 END) as has_applied
    FROM candidates c
    LEFT JOIN owners o ON c.recruiter_id = o.id
    LEFT JOIN activity_logs al ON c.id = al.candidate_id
    LEFT JOIN statuses s ON al.status_id = s.id
    WHERE 1=1 ${whereClause}
    GROUP BY c.id
  `).all(params) as Array<{
    candidate_id: string;
    has_shortlisted: number;
    has_not_suitable: number;
    has_selected: number;
    has_offer_accepted: number;
    has_hired: number;
    has_applied: number;
  }>;

  let appliedCount = 0;
  let shortlistedCount = 0;
  let notSuitableCount = 0;
  let selectedCount = 0;
  let notSelectedCount = 0;
  let offerAcceptedCount = 0;
  let offerDeclinedCount = 0;
  let hiredCount = 0;
  let notHiredCount = 0;

  for (const row of stageDataRaw) {
    if (row.has_shortlisted) {
      shortlistedCount++;
    }
    if (row.has_not_suitable && !row.has_shortlisted) {
      notSuitableCount++;
    }
    if (row.has_selected) {
      selectedCount++;
    }
    if (row.has_shortlisted && !row.has_selected) {
      notSelectedCount++;
    }
    if (row.has_offer_accepted) {
      offerAcceptedCount++;
    }
    if (row.has_selected && !row.has_offer_accepted) {
      offerDeclinedCount++;
    }
    if (row.has_hired) {
      hiredCount++;
    }
    if (row.has_offer_accepted && !row.has_hired) {
      notHiredCount++;
    }
    if (row.has_applied && !row.has_shortlisted && !row.has_not_suitable) {
      appliedCount++;
    }
  }

  const stageTotals: Record<string, number> = {
    "Application Stage": shortlistedCount + notSuitableCount + appliedCount,
    "Interview Stage": shortlistedCount,
    "Offer Stage": selectedCount,
    "Hired Stage": offerAcceptedCount,
  };

  const stageData = [
    {
      name: "Application Stage",
      segments: [
        { name: "Shortlisted", value: shortlistedCount, color: "#22c55e" },
        { name: "Not Suitable", value: notSuitableCount, color: "#ef4444" },
        { name: "Applied", value: appliedCount, color: "#9ca3af" },
      ],
    },
    {
      name: "Interview Stage",
      segments: [
        { name: "Selected", value: selectedCount, color: "#22c55e" },
        { name: "Not Selected", value: notSelectedCount, color: "#ef4444" },
      ],
    },
    {
      name: "Offer Stage",
      segments: [
        { name: "Accepted", value: offerAcceptedCount, color: "#22c55e" },
        { name: "Decline", value: offerDeclinedCount, color: "#ef4444" },
      ],
    },
    {
      name: "Hired Stage",
      segments: [
        { name: "Hires", value: hiredCount, color: "#22c55e" },
        { name: "Not Hired", value: notHiredCount, color: "#ef4444" },
      ],
    },
  ];

  return {
    total: total.count,
    today: today.count,
    lastWeek: lastWeek.count,
    lastMonth: lastMonth.count,
    statusCounts,
    positionDistribution,
    stageTotals,
    stageData,
  };
}