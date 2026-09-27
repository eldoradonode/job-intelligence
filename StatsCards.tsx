'use client'

import type { DashboardStats } from '@/types'

interface Props {
  stats: DashboardStats
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'ROLES TRACKED',
      value: stats.total_jobs,
      sub: 'deduped across sources',
      color: undefined,
    },
    {
      label: 'STRONG MATCHES',
      value: stats.high_match_jobs,
      sub: 'score 80 or above',
      color: '#22c55e',
    },
    {
      label: 'APPLIED',
      value: stats.applied,
      sub: 'applications sent',
      color: '#8b5cf6',
    },
    {
      label: 'OUTREACH DRAFTED',
      value: stats.outreach_drafted,
      sub: 'ready to send',
      color: '#f59e0b',
    },
    {
      label: 'RESPONSES',
      value: stats.responses,
      sub: 'replies received',
      color: '#2dd4bf',
    },
    {
      label: 'CONNECTIONS',
      value: stats.total_connections,
      sub: `across ${stats.total_companies} companies`,
      color: undefined,
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 12,
      marginBottom: 32,
    }}>
      {cards.map(card => (
        <div
          key={card.label}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '20px 22px',
          }}
        >
          <div style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            marginBottom: 10,
          }}>
            {card.label}
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 400,
            color: card.color || 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {card.value?.toLocaleString() ?? '—'}
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginTop: 6,
          }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
