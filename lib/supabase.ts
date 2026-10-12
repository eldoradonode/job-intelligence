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
    .order('match_score', { ascending: false, nullsFirst: false })

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
  const MIN_SCORE = 65
  const MAX_JOBS = 400
  const CHUNK = 50

  // 1. Jobs worth showing: score >= 65 or anything you have acted on
  const { data: jobRows, error: jobErr } = await supabase
    .from('network_graph')
    .select('*')
    .eq('node_type', 'job')
    .or(`match_score.gte.${MIN_SCORE},status.in.(applied,outreach_drafted,interviewing)`)
    .order('match_score', { ascending: false, nullsFirst: false })
    .limit(MAX_JOBS)

  if (jobErr) throw jobErr
  const jobs = jobRows || []

  const companyIdList = Array.from(
    new Set(jobs.map((j) => j.parent_id).filter(Boolean))
  ) as string[]

  const chunks: string[][] = []
  for (let i = 0; i < companyIdList.length; i += CHUNK) {
    chunks.push(companyIdList.slice(i, i + CHUNK))
  }

  // 2. Only the companies those jobs belong to
  const companyResults = await Promise.all(
    chunks.map((ids) =>
      supabase
        .from('network_graph')
        .select('*')
        .eq('node_type', 'company')
        .in('id', ids)
        .limit(1000)
    )
  )

  // 3. Only connections at those companies
  const connResults = await Promise.all(
    chunks.map((ids) =>
      supabase
        .from('network_graph')
        .select('*')
        .eq('node_type', 'connection')
        .in('parent_id', ids)
        .limit(1000)
    )
  )

  for (const r of [...companyResults, ...connResults]) {
    if (r.error) throw r.error
  }

  const companies = companyResults.flatMap((r) => r.data || [])
  const connections = connResults.flatMap((r) => r.data || [])
  const rows = [...companies, ...jobs, ...connections]

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

  const links: NetworkLink[] = []
  const companyIds = new Set(companies.map((r) => r.id))

  for (const row of companies) {
    links.push({ source: 'you', target: row.id, type: 'you_company' })
  }

  for (const row of [...jobs, ...connections]) {
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

// ── Network page data (bounded: scales with matches, not table size) ──

const NETWORK_MIN_SCORE = 50
const NETWORK_MAX_JOBS = 600
const NETWORK_ACTED = 'applied,outreach_drafted,interviewing'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function getNetworkData(): Promise<{
  jobs: Job[]
  companies: Company[]
  connections: Connection[]
  totalJobs: number
}> {
  const [mainRes, archivedRes, countRes] = await Promise.all([
    supabase
      .from('jobs_with_company')
      .select('*')
      .not('status', 'eq', 'archived')
      .or(`match_score.gte.${NETWORK_MIN_SCORE},status.in.(${NETWORK_ACTED})`)
      .order('match_score', { ascending: false, nullsFirst: false })
      .limit(NETWORK_MAX_JOBS),
    supabase
      .from('jobs_with_company')
      .select('*')
      .eq('status', 'archived')
      .not('match_score', 'is', null)
      .gte('match_score', 50)
      .order('match_score', { ascending: false, nullsFirst: false })
      .limit(30),
    supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .not('status', 'eq', 'archived'),
  ])

  for (const r of [mainRes, archivedRes, countRes]) {
    if (r.error) throw r.error
  }

  const jobs = [
    ...((mainRes.data as Job[]) || []),
    ...((archivedRes.data as Job[]) || []),
  ]

  const companyIds = Array.from(
    new Set(jobs.map((j) => (j as any).company_id).filter(Boolean))
  ) as string[]

  const [companyRes, connectionRes] = await Promise.all([
    Promise.all(
      chunk(companyIds, 50).map((ids) =>
        supabase.from('companies').select('*').in('id', ids)
      )
    ),
    Promise.all(
      chunk(companyIds, 50).map((ids) =>
        supabase.from('connections').select('*').in('company_id', ids)
      )
    ),
  ])

  for (const r of [...companyRes, ...connectionRes]) {
    if (r.error) throw r.error
  }

  const companies = companyRes
    .flatMap((r) => (r.data as Company[]) || [])
    .sort((a, b) => String((a as any).name).localeCompare(String((b as any).name)))
  const connections = connectionRes.flatMap((r) => (r.data as Connection[]) || [])

  return { jobs, companies, connections, totalJobs: countRes.count ?? 0 }
}
