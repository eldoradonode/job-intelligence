'use client'

import { useEffect, useState } from 'react'
import type { Job } from '@/types'
import { getJobs } from '@/lib/supabase'
import { scoreColor, statusLabel, statusDot, timeAgo } from '@/lib/utils'

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getJobs().then(j => { setJobs(j); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = jobs.filter(j =>
    !search ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.company_name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>Jobs</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{jobs.length} roles tracked</div>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs…"
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: 8, padding: '7px 12px', fontSize: 12,
              color: 'var(--text-primary)', outline: 'none', width: 200,
            }}
          />
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filtered.map(job => (
              <div key={job.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 16px', background: 'var(--bg-surface)',
                borderRadius: 8, border: '1px solid var(--border-subtle)',
                marginBottom: 6,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{job.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{job.company_name} · {job.location || 'Remote'}</div>
                </div>
                {job.match_score != null && (
                  <div style={{ fontSize: 14, fontWeight: 500, color: scoreColor(job.match_score), fontFamily: 'monospace', flexShrink: 0 }}>
                    {job.match_score}
                  </div>
                )}
                <div style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20,
                  border: `1px solid ${statusDot(job.status)}`,
                  color: statusDot(job.status), flexShrink: 0,
                }}>
                  {statusLabel(job.status)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(job.created_at)}</div>
                <a href={job.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--accent-blue)', textDecoration: 'none', flexShrink: 0 }}>
                  View →
                </a>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 24, textAlign: 'center' }}>No jobs found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
