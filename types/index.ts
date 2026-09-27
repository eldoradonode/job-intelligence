export type JobStatus =
  | 'new'
  | 'watching'
  | 'outreach_drafted'
  | 'applied'
  | 'interviewing'
  | 'rejected'
  | 'offer'
  | 'archived'

export type ApplicationStatus =
  | 'drafted'
  | 'sent'
  | 'opened'
  | 'replied'
  | 'no_response'
  | 'not_interested'

export type ConnectionRelationship = 'strong' | 'warm' | 'cold' | 'unknown'

export type LocationRegion =
  | 'remote_global'
  | 'remote_emea'
  | 'remote_us_canada'
  | 'remote_apac'
  | 'hybrid'
  | 'onsite'

export type JobSource = 'apify' | 'himalayas' | 'manual' | 'remotive' | 'mixed'

export interface Company {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website: string | null
  industry: string | null
  size: string | null
  created_at: string
}

export interface Job {
  id: string
  company_id: string
  title: string
  location: string | null
  region: LocationRegion | null
  url: string
  description: string | null
  employment_type: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  match_score: number | null
  match_reasons: string[] | null
  status: JobStatus
  source: JobSource
  source_id: string | null
  scored_at: string | null
  expires_at: string | null
  created_at: string
  // From jobs_with_company view
  company_name?: string
  company_slug?: string
  company_logo?: string | null
  company_website?: string | null
  company_industry?: string | null
  outreach_count?: number
  latest_outreach_status?: ApplicationStatus | null
}

export interface Connection {
  id: string
  name: string
  company_id: string | null
  company_name: string | null
  role: string | null
  linkedin_url: string | null
  email: string | null
  relationship: ConnectionRelationship
  notes: string | null
  connected_since: string | null
  created_at: string
}

export interface Application {
  id: string
  job_id: string
  connection_id: string | null
  status: ApplicationStatus
  message_draft: string | null
  message_sent: string | null
  channel: string
  drafted_at: string | null
  sent_at: string | null
  opened_at: string | null
  replied_at: string | null
  applied_at: string | null
  notes: string | null
  created_at: string
}

export interface DashboardStats {
  total_jobs: number
  high_match_jobs: number
  applied: number
  outreach_drafted: number
  responses: number
  total_connections: number
  total_companies: number
  avg_match_score: number
}

// D3 Network graph types
export type NodeType = 'you' | 'company' | 'job' | 'connection'

export interface NetworkNode {
  id: string
  type: NodeType
  label: string
  match_score?: number | null
  status?: string | null
  region?: string | null
  weight?: number
  // D3 simulation adds these
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  angle?: number
  radius?: number
}

export interface NetworkLink {
  source: string | NetworkNode
  target: string | NetworkNode
  type: 'company_job' | 'job_connection' | 'you_company' | 'outreach'
}

export interface NetworkGraph {
  nodes: NetworkNode[]
  links: NetworkLink[]
}

export interface ScoreDistributionBucket {
  range: string
  count: number
  isHighMatch: boolean
}
