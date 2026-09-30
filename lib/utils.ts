import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { JobStatus, LocationRegion, ConnectionRelationship } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function scoreColor(score: number | null | undefined): string {
  if (!score) return '#444440'
  if (score >= 90) return '#4ade80'  // green
  if (score >= 80) return '#86efac'  // light green
  if (score >= 70) return '#fbbf24'  // amber
  if (score >= 60) return '#fb923c'  // orange
  return '#6b7280'                   // gray
}

export function scoreRing(score: number | null | undefined): string {
  if (!score) return '#2a2a28'
  if (score >= 90) return '#16a34a'
  if (score >= 80) return '#15803d'
  if (score >= 70) return '#d97706'
  if (score >= 60) return '#ea580c'
  return '#374151'
}

export function scoreBg(score: number | null | undefined): string {
  if (!score) return '#1a1a18'
  if (score >= 80) return '#052e16'
  if (score >= 70) return '#1c1408'
  return '#0f0f0d'
}

export function statusLabel(status: JobStatus): string {
  const map: Record<JobStatus, string> = {
    new: 'New',
    watching: 'Watching',
    outreach_drafted: 'Outreach drafted',
    applied: 'Applied',
    interviewing: 'Interviewing',
    rejected: 'Rejected',
    offer: 'Offer',
    archived: 'Archived',
    country_restricted: 'Not eligible',
  }
  return map[status] || status
}

export function statusDot(status: JobStatus): string {
  const map: Record<JobStatus, string> = {
    new: '#6b7280',
    watching: '#3b82f6',
    outreach_drafted: '#f59e0b',
    applied: '#8b5cf6',
    interviewing: '#06b6d4',
    rejected: '#ef4444',
    offer: '#22c55e',
    archived: '#374151',
    country_restricted: '#ef4444',
  }
  return map[status] || '#6b7280'
}

export function regionLabel(region: LocationRegion | null | undefined): string {
  const map: Record<LocationRegion, string> = {
    remote_global: 'Remote — Global',
    remote_emea: 'Remote — EMEA',
    remote_us_canada: 'Remote — US/Canada',
    remote_apac: 'Remote — APAC',
    hybrid: 'Hybrid',
    onsite: 'On-site',
  }
  return region ? (map[region] || region) : 'Remote'
}

export function relationshipColor(rel: ConnectionRelationship): string {
  const map: Record<ConnectionRelationship, string> = {
    strong: '#22c55e',
    warm: '#f59e0b',
    cold: '#6b7280',
    unknown: '#374151',
  }
  return map[rel] || '#374151'
}

export function formatSalary(
  min: number | null,
  max: number | null,
  currency = 'USD'
): string {
  if (!min && !max) return 'Salary not listed'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return 'Salary not listed'
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

// Node colors for D3 radial viz
export const NODE_COLORS = {
  you: { fill: '#ffffff', stroke: '#ffffff', text: '#000000' },
  company: { fill: '#0f172a', stroke: '#3b82f6', text: '#93c5fd' },
  job_high: { fill: '#052e16', stroke: '#22c55e', text: '#86efac' },   // 80+
  job_mid: { fill: '#1c1408', stroke: '#f59e0b', text: '#fcd34d' },    // 65–79
  job_low: { fill: '#111110', stroke: '#4b5563', text: '#9ca3af' },    // <65
  connection_strong: { fill: '#042f2e', stroke: '#2dd4bf', text: '#99f6e4' },
  connection_warm: { fill: '#1c1a08', stroke: '#f59e0b', text: '#fcd34d' },
  connection_cold: { fill: '#111110', stroke: '#4b5563', text: '#9ca3af' },
  drafted: { fill: '#1c0a05', stroke: '#f97316', text: '#fdba74' },
}

export const ARC_SEGMENTS = [
  { id: 'remote_global',   label: 'Remote — Global',    color: '#3b82f6' },
  { id: 'remote_emea',     label: 'Remote — EMEA',      color: '#8b5cf6' },
  { id: 'remote_us_canada',label: 'Remote — US/Canada', color: '#06b6d4' },
  { id: 'remote_apac',     label: 'Remote — APAC',      color: '#10b981' },
  { id: 'watching',        label: 'Watching',            color: '#3b82f6' },
  { id: 'outreach_drafted',label: 'Outreach drafted',   color: '#f59e0b' },
  { id: 'applied',         label: 'Applied',             color: '#8b5cf6' },
  { id: 'high_match',      label: 'High match (80+)',   color: '#22c55e' },
]
