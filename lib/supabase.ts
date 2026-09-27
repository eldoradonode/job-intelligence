import { createClient } from '@supabase/supabase-js'
import type {
  Job,
  Company,
  Connection,
  Application,
  DashboardStats,
  NetworkGraph,
  NetworkNode,
  NetworkLink,
} from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Jobs ──────────────────────────────────────────────────────

export async function getJobs(filters?: {
  minScore?: number
  status?: string
  region?: string
  search?: string
}): Promise<Job[]> {
  let query = supabase
    .from('jobs_with_company')
    .select('*')
    .not('status', 'eq', 'archived')
    .order('match_score', { ascending: false })

  if (filters?.minScore) {
    query = query.gte('match_score', filters.minScore)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.region) {
    query = query.eq('region', filters.region)
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return (data as Job[]) || []
}

export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs_with_company')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Job
}

export async function updateJobStatus(id: string, status: string) {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_STATUS
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'job', id, status }),
    })
  } else {
    await supabase.from('jobs').update({ status }).eq('id', id)
  }
}

// ── Companies ─────────────────────────────────────────────────

export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name')
  if (error) throw error
  return (data as Company[]) || []
}

// ── Connections ───────────────────────────────────────────────

export async function getConnections(companyId?: string): Promise<Connection[]> {
  let query = supabase.from('connections').select('*').order('name')
  if (companyId) {
    query = query.eq('company_id', companyId)
  }
  const { data, error } = await query
  if (error) throw error
  return (data as Connection[]) || []
}

// ── Applications ──────────────────────────────────────────────

export async function getApplicationsByJob(jobId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Application[]) || []
}

export async function generateOutreachDraft(
  jobId: string,
  connectionId?: string
): Promise<{ message_draft: string; success: boolean }> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_OUTREACH
  if (!webhookUrl) {
    return { success: false, message_draft: 'Outreach webhook not configured.' }
  }
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, connection_id: connectionId }),
  })
  const json = await res.json()
  return json
}

// ── Dashboard stats ───────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single()
  if (error) throw error
  return data as DashboardStats
}

export async function getScoreDistribution(): Promise<
  { range: string; count: number; isHighMatch: boolean }[]
> {
  const { data, error } = await supabase
    .from('jobs')
    .select('match_score')
    .not('match_score', 'is', null)
    .not('status', 'eq', 'archived')

  if (error) throw error

  const buckets: Record<string, number> = {
    '0–9': 0, '10–19': 0, '20–29': 0, '30–39': 0,
    '40–49': 0, '50–59': 0, '60–69': 0, '70–79': 0,
    '80–89': 0, '90–100': 0,
  }

  for (const row of data || []) {
    const score = row.match_score as number
    const bucket = Math.floor(score / 10) * 10
    const key = bucket >= 90 ? '90–100' : `${bucket}–${bucket + 9}`
    if (key in buckets) buckets[key]++
  }

  return Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
    isHighMatch: parseInt(range) >= 80,
  }))
}

// ── Network graph data ────────────────────────────────────────

export async function getNetworkGraph(): Promise<NetworkGraph> {
  const { data, error } = await supabase
    .from('network_graph')
    .select('*')

  if (error) throw error

  const rows = data || []

  // Build nodes
  const nodes: NetworkNode[] = [
    { id: 'you', type: 'you', label: 'You', weight: 1 },
  ]

  for (const row of rows) {
    nodes.push({
      id: row.id,
      type: row.node_type as 'company' | 'job' | 'connection',
      label: row.label,
      match_score: row.match_score,
      status: row.status,
      region: row.region,
      weight: row.weight || 1,
    })
  }

  // Build links
  const links: NetworkLink[] = []
  const companyIds = new Set(
    rows.filter((r) => r.node_type === 'company').map((r) => r.id)
  )

  // You → Companies
  for (const row of rows.filter((r) => r.node_type === 'company')) {
    links.push({ source: 'you', target: row.id, type: 'you_company' })
  }

  // Companies → Jobs, Companies → Connections
  for (const row of rows.filter((r) => r.node_type !== 'company')) {
    if (row.parent_id && companyIds.has(row.parent_id)) {
      links.push({
        source: row.parent_id,
        target: row.id,
        type: row.node_type === 'job' ? 'company_job' : 'job_connection',
      })
    }
  }

  return { nodes, links }
}
