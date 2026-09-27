'use client'

import { Search } from 'lucide-react'

interface Props {
  filterRegion: string | null
  filterStatus: string | null
  filterMinScore: number
  search: string
  onRegion: (v: string | null) => void
  onStatus: (v: string | null) => void
  onMinScore: (v: number) => void
  onSearch: (v: string) => void
  stats: {
    total: number
    highMatch: number
    drafted: number
    applied: number
  }
}

const REGIONS = [
  { id: 'remote_global',    label: 'Remote — Global' },
  { id: 'remote_emea',      label: 'Remote — EMEA' },
  { id: 'remote_us_canada', label: 'Remote — US/Canada' },
  { id: 'remote_apac',      label: 'Remote — APAC' },
]

const STATUSES = [
  { id: 'watching',         label: 'Watching' },
  { id: 'outreach_drafted', label: 'Outreach drafted' },
  { id: 'applied',          label: 'Applied' },
  { id: 'interviewing',     label: 'Interviewing' },
]

const SCORE_PRESETS = [
  { label: 'All',   value: 0 },
  { label: '65+',   value: 65 },
  { label: '75+',   value: 75 },
  { label: '80+',   value: 80 },
  { label: '90+',   value: 90 },
]

const LEGEND = [
  { color: '#3b82f6', label: 'Company',        shape: 'circle' },
  { color: '#22c55e', label: 'High match job', shape: 'circle' },
  { color: '#f59e0b', label: 'Mid match job',  shape: 'circle' },
  { color: '#f97316', label: 'Outreach drafted', shape: 'circle' },
  { color: '#2dd4bf', label: 'Strong contact',  shape: 'circle' },
  { color: '#6b7280', label: 'Cold contact',    shape: 'circle' },
]

export default function NetworkFilters({
  filterRegion, filterStatus, filterMinScore,
  search, onRegion, onStatus, onMinScore, onSearch, stats,
}: Props) {
  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      borderLeft: '1px solid var(--border-subtle)',
      background: 'var(--bg-surface)',
      overflowY: 'auto',
      padding: '20px 16px',
    }}>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          padding: '6px 10px',
        }}>
          <Search size={13} color="var(--text-muted)" strokeWidth={1.5} />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search jobs, companies…"
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 12,
              color: 'var(--text-primary)',
              width: '100%',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ marginBottom: 24 }}>
        <Label>Overview</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <Stat label="Total" value={stats.total} />
          <Stat label="80+ match" value={stats.highMatch} color="#22c55e" />
          <Stat label="Drafted" value={stats.drafted} color="#f97316" />
          <Stat label="Applied" value={stats.applied} color="#8b5cf6" />
        </div>
      </div>

      {/* Score filter */}
      <div style={{ marginBottom: 24 }}>
        <Label>Min score</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {SCORE_PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => onMinScore(p.value)}
              style={{
                padding: '3px 9px',
                borderRadius: 20,
                border: `1px solid ${filterMinScore === p.value ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                background: filterMinScore === p.value ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: filterMinScore === p.value ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Region filter */}
      <div style={{ marginBottom: 24 }}>
        <Label>Region</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FilterRow
            label="All regions"
            active={filterRegion === null}
            onClick={() => onRegion(null)}
          />
          {REGIONS.map(r => (
            <FilterRow
              key={r.id}
              label={r.label}
              active={filterRegion === r.id}
              onClick={() => onRegion(filterRegion === r.id ? null : r.id)}
            />
          ))}
        </div>
      </div>

      {/* Status filter */}
      <div style={{ marginBottom: 24 }}>
        <Label>Status</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FilterRow
            label="All statuses"
            active={filterStatus === null}
            onClick={() => onStatus(null)}
          />
          {STATUSES.map(s => (
            <FilterRow
              key={s.id}
              label={s.label}
              active={filterStatus === s.id}
              onClick={() => onStatus(filterStatus === s.id ? null : s.id)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div>
        <Label>Legend</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 10, height: 10,
                borderRadius: '50%',
                border: `1.5px solid ${l.color}`,
                background: l.color + '20',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
            </div>
          ))}
          {/* Orbit rings */}
          <div style={{ marginTop: 4, borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>
              Ring distance
            </div>
            {[
              { r: 1, label: 'Companies' },
              { r: 2, label: 'Jobs' },
              { r: 3, label: 'Connections' },
            ].map(o => (
              <div key={o.r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{
                  width: 18, height: 1,
                  borderTop: '1px dashed var(--border-strong)',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Ring {o.r} — {o.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10,
      color: 'var(--text-muted)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 6,
      padding: '8px 10px',
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 500,
        color: color || 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
        {label}
      </div>
    </div>
  )
}

function FilterRow({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        borderRadius: 6,
        border: 'none',
        background: active ? 'var(--bg-active)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontSize: 12,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-sans)',
        width: '100%',
      }}
    >
      {active && (
        <span style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'var(--accent-blue)', flexShrink: 0,
        }} />
      )}
      {label}
    </button>
  )
}
