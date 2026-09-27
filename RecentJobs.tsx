'use client'

import Link from 'next/link'
import type { Job } from '@/types'
import { scoreColor, statusLabel, statusDot, regionLabel, timeAgo } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface Props {
  jobs: Job[]
}

export default function RecentJobs({ jobs }: Props) {
  if (!jobs.length) {
    return (
      <div style={{
        textAlign: 'center', padding: '40px 0',
        color: 'var(--text-muted)', fontSize: 13,
      }}>
        No jobs yet. Run the ingestion workflow to pull listings.
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 140px 100px 80px 90px 32px',
        gap: 0,
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 8,
        marginBottom: 2,
      }}>
        {['Role', 'Company', 'Region', 'Score', 'Status', ''].map(h => (
          <div key={h} style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '0 8px',
          }}>
            {h}
          </div>
        ))}
      </div>

      {jobs.map((job, i) => (
        <div
          key={job.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 100px 80px 90px 32px',
            gap: 0,
            borderBottom: i < jobs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            padding: '10px 0',
            alignItems: 'center',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Title */}
          <div style={{ padding: '0 8px', minWidth: 0 }}>
            <div style={{
              fontSize: 13,
              color: 'var(--text-primary)',
              fontWeight: 400,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {job.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {timeAgo(job.created_at)}
            </div>
          </div>

          {/* Company */}
          <div style={{ padding: '0 8px' }}>
            <div style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {job.company_name || '—'}
            </div>
          </div>

          {/* Region */}
          <div style={{ padding: '0 8px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {regionLabel(job.region)}
            </div>
          </div>

          {/* Score */}
          <div style={{ padding: '0 8px' }}>
            {job.match_score != null ? (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 500,
                color: scoreColor(job.match_score),
              }}>
                {job.match_score}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
            )}
          </div>

          {/* Status */}
          <div style={{ padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                className="status-dot"
                style={{ background: statusDot(job.status) }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {statusLabel(job.status)}
              </span>
            </div>
          </div>

          {/* Link */}
          <div style={{ padding: '0 8px' }}>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              title="View job"
            >
              <ExternalLink size={13} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
