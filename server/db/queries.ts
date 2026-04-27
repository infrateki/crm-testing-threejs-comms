import { pool } from './pool.js';

export interface OpportunityRow {
  id: string;
  title: string;
  agency: string;
  portal_id: string | null;
  status: string;
  tier: number;
  score: string;
  owner: string;
  value: string | null;
  deadline: string | null;
  posted_date: string;
  due_date: string | null;
  description: string | null;
  notes: string | null;
  tags: string[];
  naics_code: string | null;
  set_aside: string | null;
  ghl_contact_id: string | null;
  created_at: string;
  updated_at: string;
  contacts?: unknown;
  photos?: unknown;
}

export interface OpportunityFiltersQuery {
  status?: string[];
  tier?: number[];
  owner?: string[];
  portal?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

const ALLOWED_UPDATE_FIELDS = new Set([
  'status', 'owner', 'tier', 'score', 'notes', 'tags',
  'value', 'deadline', 'due_date', 'description',
]);

export async function getOpportunities(filters: OpportunityFiltersQuery = {}) {
  const { page = 1, limit = 50, status, tier, owner, portal, search } = filters;
  const offset = (page - 1) * limit;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (status?.length) {
    params.push(status);
    conditions.push(`status = ANY($${params.length}::text[])`);
  }
  if (tier?.length) {
    params.push(tier);
    conditions.push(`tier = ANY($${params.length}::int[])`);
  }
  if (owner?.length) {
    params.push(owner);
    conditions.push(`owner = ANY($${params.length}::text[])`);
  }
  if (portal?.length) {
    params.push(portal);
    conditions.push(`portal_id = ANY($${params.length}::uuid[])`);
  }
  if (search) {
    params.push(`%${search}%`);
    const idx = params.length;
    conditions.push(`(title ILIKE $${idx} OR agency ILIKE $${idx})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const [dataResult, countResult] = await Promise.all([
    pool.query<OpportunityRow>(
      `SELECT * FROM opportunities ${where} ORDER BY deadline ASC NULLS LAST, posted_date DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM opportunities ${where}`,
      params.slice(0, params.length - 2),
    ),
  ]);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0]?.count ?? '0', 10),
    page,
    limit,
  };
}

export async function getOpportunityById(id: string): Promise<OpportunityRow | undefined> {
  const result = await pool.query<OpportunityRow>(
    `SELECT o.*,
      json_agg(DISTINCT jsonb_build_object(
        'id', c.id, 'name', c.name, 'email', c.email, 'phone', c.phone,
        'role_tag', c.role_tag, 'agency', c.agency, 'ghl_contact_id', c.ghl_contact_id,
        'notes', c.notes, 'created_at', c.created_at
      )) FILTER (WHERE c.id IS NOT NULL) AS contacts,
      json_agg(DISTINCT jsonb_build_object(
        'id', p.id, 'url', p.url, 'caption', p.caption,
        'processed', p.processed, 'created_at', p.created_at
      )) FILTER (WHERE p.id IS NOT NULL) AS photos
    FROM opportunities o
    LEFT JOIN contacts c ON c.opportunity_id = o.id
    LEFT JOIN opportunity_photos p ON p.opportunity_id = o.id
    WHERE o.id = $1
    GROUP BY o.id`,
    [id],
  );
  return result.rows[0];
}

export async function updateOpportunity(
  id: string,
  updates: Record<string, unknown>,
): Promise<OpportunityRow | undefined> {
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([k]) => ALLOWED_UPDATE_FIELDS.has(k)),
  );
  const keys = Object.keys(safeUpdates);
  if (keys.length === 0) return getOpportunityById(id);

  const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values: unknown[] = [id, ...Object.values(safeUpdates)];

  const result = await pool.query<OpportunityRow>(
    `UPDATE opportunities SET ${setClauses}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    values,
  );
  return result.rows[0];
}

export async function getKPI() {
  const result = await pool.query<{
    total_opportunities: string;
    total_value: string | null;
    active_pursuits: string;
    deadlines_this_month: string;
    win_rate: string | null;
    avg_days_to_close: string | null;
  }>(
    `SELECT
      COUNT(*)::text AS total_opportunities,
      SUM(value)::text AS total_value,
      COUNT(*) FILTER (WHERE status IN ('qualified','jorge_review','contact','proposal'))::text AS active_pursuits,
      COUNT(*) FILTER (WHERE deadline BETWEEN NOW() AND NOW() + INTERVAL '30 days')::text AS deadlines_this_month,
      ROUND(
        COUNT(*) FILTER (WHERE status = 'won')::numeric /
        NULLIF(COUNT(*) FILTER (WHERE status IN ('won','lost')), 0) * 100, 1
      )::text AS win_rate,
      AVG(EXTRACT(EPOCH FROM (updated_at - posted_date::timestamptz)) / 86400)
        FILTER (WHERE status = 'won')::text AS avg_days_to_close
    FROM opportunities`,
  );

  const byStatus = await pool.query<{ status: string; count: string }>(
    `SELECT status, COUNT(*)::text AS count FROM opportunities GROUP BY status`,
  );

  const byOwner = await pool.query<{ owner: string; count: string }>(
    `SELECT owner, COUNT(*)::text AS count FROM opportunities GROUP BY owner`,
  );

  const row = result.rows[0];
  return {
    total_opportunities: parseInt(row?.total_opportunities ?? '0', 10),
    total_value: parseFloat(row?.total_value ?? '0'),
    active_pursuits: parseInt(row?.active_pursuits ?? '0', 10),
    deadlines_this_month: parseInt(row?.deadlines_this_month ?? '0', 10),
    win_rate: parseFloat(row?.win_rate ?? '0'),
    avg_days_to_close: parseFloat(row?.avg_days_to_close ?? '0'),
    by_status: Object.fromEntries(byStatus.rows.map((r) => [r.status, parseInt(r.count, 10)])),
    by_owner: Object.fromEntries(byOwner.rows.map((r) => [r.owner, parseInt(r.count, 10)])),
  };
}

export async function getDeadlines(days: number) {
  const result = await pool.query<{
    id: string;
    title: string;
    agency: string;
    deadline: string;
    days_until: number;
    status: string;
    tier: number;
    value: string | null;
  }>(
    `SELECT id, title, agency, deadline, tier, value,
      EXTRACT(DAY FROM deadline::timestamptz - NOW())::integer AS days_until,
      status
    FROM opportunities
    WHERE deadline BETWEEN NOW() AND NOW() + ($1 || ' days')::interval
      AND status NOT IN ('won','lost','dismissed')
    ORDER BY deadline ASC`,
    [days],
  );

  return result.rows.map((r) => ({
    ...r,
    value: r.value != null ? parseFloat(r.value) : null,
  }));
}

export async function getPortals() {
  const result = await pool.query(
    `SELECT * FROM portals ORDER BY name`,
  );
  return result.rows;
}

export async function getAlerts() {
  const result = await pool.query<{
    type: string;
    id: string;
    title: string;
    deadline: string | null;
  }>(
    `SELECT 'deadline' AS type, id::text, title, deadline::text
      FROM opportunities
      WHERE deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        AND status NOT IN ('won','lost','dismissed')
    UNION ALL
    SELECT 'portal_error' AS type, id::text, name AS title, last_scan_at::text AS deadline
      FROM portals
      WHERE last_scan_status = 'error'
    ORDER BY deadline ASC NULLS LAST`,
  );
  return result.rows;
}

export async function insertPhoto(opportunityId: string, url: string) {
  const result = await pool.query<{
    id: string;
    opportunity_id: string;
    url: string;
    caption: string | null;
    processed: boolean;
    created_at: string;
  }>(
    `INSERT INTO opportunity_photos (id, opportunity_id, url, processed)
     VALUES (gen_random_uuid(), $1, $2, false)
     RETURNING *`,
    [opportunityId, url],
  );
  return result.rows[0];
}

export async function updatePhoto(
  opportunityId: string,
  photoId: string,
  updates: { caption?: string; processed?: boolean },
) {
  const result = await pool.query<{
    id: string;
    opportunity_id: string;
    url: string;
    caption: string | null;
    processed: boolean;
    created_at: string;
  }>(
    `UPDATE opportunity_photos
     SET caption = COALESCE($1, caption), processed = COALESCE($2, processed)
     WHERE id = $3 AND opportunity_id = $4
     RETURNING *`,
    [updates.caption ?? null, updates.processed ?? null, photoId, opportunityId],
  );
  return result.rows[0];
}
