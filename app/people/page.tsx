'use client'

import { useEffect, useState } from 'react'
import type { Connection } from '@/types'
import { getConnections } from '@/lib/supabase'

const REL_COLOR: Record<string, string> = { strong: '#22c55e', warm: '#f59e0b', cold: '#6b7280', unknown: '#374151' }

export default function PeoplePage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getConnections()
      .then(c => { setConnections(c); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)' }}>People</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{loading ? 'Loading…' : `${connections.length} connections`}</div>
        </div>
        {error && <div style={{ padding: '12px 16px', background: '#1c0a05', border: '1px solid #f97316', borderRadius: 8, fontSize: 12, color: '#fdba74', marginBottom: 16 }}>Failed to load: {error}</div>}
        {!loading && !error && connections.length === 0 && <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No connections yet. Add people to your connections table in Supabase.</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {connections.map(cn => (
            <div key={cn.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'var(--bg-elevated)', border: `1px solid ${REL_COLOR[cn.relationship] || '#374151'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {cn.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{cn.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{[cn.role, cn.company_name].filter(Boolean).join(' · ') || '—'}</div>
              </div>
              <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, flexShrink: 0, border: `1px solid ${REL_COLOR[cn.relationship] || '#374151'}`, color: REL_COLOR[cn.relationship] || '#6b7280' }}>{cn.relationship}</div>
              {cn.linkedin_url && <a href={cn.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent-blue)', textDecoration: 'none', flexShrink: 0 }}>LinkedIn →</a>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
