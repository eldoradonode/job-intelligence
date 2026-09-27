'use client'

import { useEffect, useState } from 'react'
import type { Connection } from '@/types'
import { getConnections } from '@/lib/supabase'

const relColor: Record<string, string> = {
  strong: '#2dd4bf', warm: '#f59e0b', cold: '#6b7280', unknown: '#374151'
}

export default function PeoplePage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConnections().then(c => { setConnections(c); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>People</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{connections.length} connections</div>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {connections.map(cn => (
              <div key={cn.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', background: 'var(--bg-surface)',
                borderRadius: 8, border: '1px solid var(--border-subtle)',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'var(--bg-elevated)', border: `1px solid ${relColor[cn.relationship] || '#374151'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0,
                }}>
                  {cn.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{cn.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                    {cn.role || '—'} {cn.company_name ? `· ${cn.company_name}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: relColor[cn.relationship] || '#6b7280', flexShrink: 0 }}>
                  {cn.relationship}
                </div>
                {cn.linkedin_url && (
                  <a href={cn.linkedin_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11, color: 'var(--accent-blue)', textDecoration: 'none', flexShrink: 0 }}>
                    LinkedIn →
                  </a>
                )}
              </div>
            ))}
            {connections.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 24, textAlign: 'center' }}>
                No connections yet. Add people via Supabase.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
