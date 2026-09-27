'use client'
import { useEffect } from 'react'

export default function NetworkError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Network page error:', error) }, [error])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, background: 'var(--bg-base)' }}>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Network view failed to load</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
        {error.message || 'Check your Supabase connection and env vars.'}
      </div>
      <button onClick={reset} style={{ fontSize: 12, padding: '6px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
        Try again
      </button>
    </div>
  )
}
