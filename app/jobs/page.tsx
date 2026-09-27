'use client'

import { useEffect, useState } from 'react'
import type { Job } from '@/types'
import { getJobs } from '@/lib/supabase'
import { scoreColor, statusLabel, statusDot, regionLabel, timeAgo } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

const STATUSES = ['all','watching','outreach_drafted','applied','interviewing','rejected','archived'] as const

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    getJobs()
      .then(j => { setJobs(j); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const filtered = jobs.filter(j => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return j.title.toLowerCase().includes(q) || (j.company_name || '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>Jobs</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {loading ? 'Loading…' : `${filtered.length} of ${jobs.length} roles`}
            </div>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or company…"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: 'var(--text-primary)', outline: 'none', width: 220, fontFamily: 'var(--font-sans)' }} />
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)', border: `1px solid ${statusFilter === s ? 'var(--accent-blue)' : 'var(--border-default)'}`, background: statusFilter === s ? 'rgba(59,130,246,0.12)' : 'transparent', color: statusFilter === s ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
              {s === 'all' ? 'All' : statusLabel(s as Job['status'])}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#1c0a05', border: '1px solid #f97316', borderRadius: 8, fontSize: 12, color: '#fdba74', marginBottom: 16 }}>
            Failed to load: {error} — check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px 70px 110px 32px', padding: '0 12px 8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
              {['Role','Company','Region','Score','Status',''].map(h => (
                <div key={h} style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>
            {filtered.map(job => (
              <div key={job.id} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px 70px 110px 32px', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(job.created_at)}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company_name || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{regionLabel(job.region)}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: scoreColor(job.match_score) }}>{job.match_score ?? '—'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusDot(job.status), flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{statusLabel(job.status)}</span>
                </div>
                <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex' }}>
                  <ExternalLink size={13} strokeWidth={1.5} />
                </a>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No jobs found</div>}
          </>
        )}
      </div>
    </div>
  )
}
