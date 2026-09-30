"use client";
'use client'

import { useState } from 'react'
import { X, ExternalLink, Send, Loader2, CheckCircle } from 'lucide-react'
import type { Job, Connection, Application } from '@/types'
import {
  scoreColor, statusLabel, statusDot, regionLabel,
  formatSalary, timeAgo,
} from '@/lib/utils'
import { generateOutreachDraft, updateJobStatus } from '@/lib/supabase'

interface Props {
  job: Job
  connections: Connection[]
  applications: Application[]
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}

const JOB_STATUSES = [
  'watching', 'outreach_drafted', 'applied', 'interviewing', 'rejected', 'offer', 'country_restricted', 'archived',
] as const

export default function JobDetailPanel({
  job, connections, applications, onClose, onStatusChange,
}: Props) {
  const [draft, setDraft] = useState<string | null>(
    applications[0]?.message_draft || null
  )
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState(job.status)

  const score = job.match_score
  const relatedConnections = connections.filter(c => c.company_id === job.company_id)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await generateOutreachDraft(
        job.id,
        relatedConnections[0]?.id
      )
      if (result.success) {
        setDraft(result.message_draft)
        setStatus('outreach_drafted')
        onStatusChange(job.id, 'outreach_drafted')
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus as typeof status)
    await updateJobStatus(job.id, newStatus)
    onStatusChange(job.id, newStatus)
  }

  function copyDraft() {
    if (draft) {
      navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="animate-in" style={{
      width: 340,
      height: '100%',
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {job.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
            {job.company_name}
          </div>
        </div>
        <button
          onClick={onClose}
          className="btn-ghost"
          style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Score */}
      {score != null && (
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 28,
              fontWeight: 500,
              color: scoreColor(score),
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
            }}>
              {score}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
              match score
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {(job.match_reasons || []).slice(0, 3).map((r, i) => (
              <div key={i} style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
                marginBottom: 4,
              }}>
                <span style={{ color: scoreColor(score), flexShrink: 0, marginTop: 1 }}>›</span>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          <Row label="Location" value={regionLabel(job.region)} />
          <Row label="Type" value={job.employment_type || '—'} />
          <Row label="Salary" value={formatSalary(job.salary_min, job.salary_max, job.salary_currency)} />
          <Row label="Source" value={job.source} />
          <Row label="Added" value={timeAgo(job.created_at)} />
        </div>

        {/* Status */}
        <Section label="Status">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {JOB_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: `1px solid ${status === s ? statusDot(s) : 'var(--border-default)'}`,
                  background: status === s ? statusDot(s) + '20' : 'transparent',
                  color: status === s ? statusDot(s) : 'var(--text-secondary)',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </Section>

        {/* Connections at this company */}
        {relatedConnections.length > 0 && (
          <Section label="People at this company">
            {relatedConnections.map(cn => (
              <div key={cn.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0,
                }}>
                  {cn.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {cn.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {cn.role}
                  </div>
                </div>
                <div style={{
                  fontSize: 10,
                  color: cn.relationship === 'strong' ? 'var(--score-high)'
                    : cn.relationship === 'warm' ? 'var(--accent-amber)'
                    : 'var(--text-muted)',
                }}>
                  {cn.relationship}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Outreach */}
        <Section label="Outreach">
          {draft ? (
            <div>
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: 12,
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: 10,
                whiteSpace: 'pre-wrap',
              }}>
                {draft}
              </div>
              <button
                onClick={copyDraft}
                className="btn btn-ghost"
                style={{ fontSize: 12, width: '100%', justifyContent: 'center' }}
              >
                {copied ? <><CheckCircle size={13} /> Copied</> : <><Send size={13} /> Copy message</>}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
            >
              {generating
                ? <><Loader2 size={13} className="animate-spin" /> Generating…</>
                : <><Send size={13} /> Generate outreach draft</>
              }
            </button>
          )}
        </Section>
      </div>

      {/* Footer — View job link */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
        >
          <ExternalLink size={13} />
          View job posting
        </a>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 64, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        marginBottom: 10,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}
